import React, { useState, useEffect } from 'react';
import { studentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  GraduationCap, 
  Award, 
  MapPin, 
  FileText, 
  Upload, 
  Plus, 
  X, 
  Check, 
  Save, 
  AlertCircle
} from 'lucide-react';

const COMMON_SKILLS = [
  "Python", "React", "SQL", "Java", "Machine Learning", "Docker", 
  "FastAPI", "PostgreSQL", "C++", "PyTorch", "Linux", "AutoCAD", 
  "IoT", "Tableau", "Cybersecurity", "Spring Boot", "Kubernetes", "Bioinformatics"
];

const SECTORS_LIST = [
  "Information Technology", "Green Energy", "Banking & FinTech", 
  "Healthcare & Pharma", "Manufacturing & Infrastructure", 
  "Automotive & Electric Vehicles", "Cybersecurity & Cloud", 
  "Public Policy & Gov-Tech"
];

const LOCATIONS_LIST = [
  "Bengaluru", "New Delhi", "Mumbai", "Pune", "Hyderabad", 
  "Chennai", "Ahmedabad", "Kolkata", "Remote"
];

export default function StudentProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Editable Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('GEN');
  const [gender, setGender] = useState('Male');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [degree, setDegree] = useState('B.Tech / B.E.');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [cgpa, setCgpa] = useState(8.0);
  const [graduationYear, setGraduationYear] = useState(2026);
  const [skills, setSkills] = useState([]);
  const [preferredSectors, setPreferredSectors] = useState([]);
  const [preferredLocations, setPreferredLocations] = useState([]);
  const [workMode, setWorkMode] = useState('Any');
  const [experienceMonths, setExperienceMonths] = useState(0);
  const [projectsCount, setProjectsCount] = useState(2);
  const [bio, setBio] = useState('');

  // New Skill Input
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');

  // Resume Upload
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await studentsAPI.getProfile();
      const p = res.data;
      setProfile(p);
      setFullName(p.full_name || '');
      setPhone(p.phone || '');
      setCategory(p.category || 'GEN');
      setGender(p.gender || 'Male');
      setCity(p.city || '');
      setState(p.state || '');
      setDegree(p.degree || 'B.Tech / B.E.');
      setFieldOfStudy(p.field_of_study || '');
      setCgpa(p.cgpa_percentage || 8.0);
      setGraduationYear(p.graduation_year || 2026);
      setSkills(p.skills || []);
      setPreferredSectors(p.preferred_sectors || []);
      setPreferredLocations(p.preferred_locations || []);
      setWorkMode(p.work_mode_preference || 'Any');
      setExperienceMonths(p.experience_months || 0);
      setProjectsCount(p.projects_count || 1);
      setBio(p.bio || '');
    } catch (err) {
      console.error("Could not load student profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (name, level = 'Intermediate') => {
    if (!name.trim()) return;
    if (skills.some(s => s.name.toLowerCase() === name.toLowerCase())) return;
    setSkills([...skills, { name: name.trim(), level }]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (name) => {
    setSkills(skills.filter(s => s.name !== name));
  };

  const toggleSector = (sector) => {
    if (preferredSectors.includes(sector)) {
      setPreferredSectors(preferredSectors.filter(s => s !== sector));
    } else {
      setPreferredSectors([...preferredSectors, sector]);
    }
  };

  const toggleLocation = (loc) => {
    if (preferredLocations.includes(loc)) {
      setPreferredLocations(preferredLocations.filter(l => l !== loc));
    } else {
      setPreferredLocations([...preferredLocations, loc]);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setErrorMessage('');

    try {
      await studentsAPI.updateProfile({
        full_name: fullName,
        phone,
        category,
        gender,
        city,
        state,
        degree,
        field_of_study: fieldOfStudy,
        cgpa_percentage: parseFloat(cgpa),
        graduation_year: parseInt(graduationYear),
        skills,
        preferred_sectors: preferredSectors,
        preferred_locations: preferredLocations,
        work_mode_preference: workMode,
        experience_months: parseInt(experienceMonths),
        projects_count: parseInt(projectsCount),
        bio
      });
      setMessage('Profile updated successfully! AI matching scores have been recalculated.');
      refreshUser();
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingResume(true);
    setMessage('');
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await studentsAPI.uploadResume(formData);
      setMessage(`Resume '${res.data.filename}' uploaded successfully!`);
      loadProfile();
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Resume upload failed.');
    } finally {
      setUploadingResume(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 text-slate-500 bg-[#000000] min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2997FF] mr-3"></div>
        <span>Loading profile settings...</span>
      </div>
    );
  }

  return (
    <div className="bg-[#000000] text-white min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#161617] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2997FF] bg-[#2997FF]/15 px-3 py-0.5 rounded-full border border-[#2997FF]/30">
                Candidate Profile
              </span>
              <span className="text-xs text-[#86868B]">
                Registration: <strong className="text-white">{profile?.registration_number}</strong>
              </span>
            </div>
            <h1 className="text-3xl font-black apple-text-gradient mt-1">
              Profile & Competencies.
            </h1>
            <p className="text-xs text-[#86868B]">
              Keep your technical skills and academic credentials updated. The AI matching engine evaluates these parameters in real time.
            </p>
          </div>

          <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${
            profile?.allocation_status === 'ALLOCATED'
              ? 'bg-[#30D158]/15 text-[#30D158] border-[#30D158]/30'
              : 'bg-[#FF9F0A]/15 text-[#FF9F0A] border-[#FF9F0A]/30'
          }`}>
            Status: {profile?.allocation_status || 'UNALLOCATED'}
          </div>
        </div>

        {message && (
          <div className="p-4 rounded-2xl bg-[#30D158]/15 border border-[#30D158]/30 text-[#30D158] text-xs font-semibold flex items-center space-x-2">
            <Check className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          
          {/* 1. Demographics */}
          <div className="p-6 rounded-3xl bg-[#161617] border border-white/10 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-white/10 pb-3">
              <User className="w-4 h-4 text-[#2997FF]" />
              <span>1. Demographics & Category</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[#86868B] mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#2997FF]"
                />
              </div>

              <div>
                <label className="block text-[#86868B] mb-1 font-medium">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#2997FF]"
                />
              </div>

              <div>
                <label className="block text-[#86868B] mb-1 font-medium">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-black/60 border border-white/10 text-white focus:outline-none"
                >
                  <option value="GEN">General (Unreserved)</option>
                  <option value="OBC_NCL">OBC (Non-Creamy Layer)</option>
                  <option value="SC">Scheduled Caste (SC)</option>
                  <option value="ST">Scheduled Tribe (ST)</option>
                  <option value="EWS">Economically Weaker Section (EWS)</option>
                  <option value="PWD">Persons with Disabilities (PwD)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#86868B] mb-1 font-medium">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-black/60 border border-white/10 text-white focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[#86868B] mb-1 font-medium">Current City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-black/60 border border-white/10 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#86868B] mb-1 font-medium">Home State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-black/60 border border-white/10 text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Education & Eligibility */}
          <div className="p-6 rounded-3xl bg-[#161617] border border-white/10 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-white/10 pb-3">
              <GraduationCap className="w-4 h-4 text-[#BF5AF2]" />
              <span>2. Academic Qualifications (Hard Constraints)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-[#86868B] mb-1 font-medium">Degree</label>
                <select
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-black/60 border border-white/10 text-white focus:outline-none"
                >
                  <option value="B.Tech / B.E.">B.Tech / B.E.</option>
                  <option value="MCA">MCA</option>
                  <option value="BCA">BCA</option>
                  <option value="B.Sc Data Science">B.Sc Data Science</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="MBA">MBA</option>
                </select>
              </div>

              <div>
                <label className="block text-[#86868B] mb-1 font-medium">Field of Study</label>
                <input
                  type="text"
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-black/60 border border-white/10 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#86868B] mb-1 font-medium">CGPA (Hard Barrier)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  required
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-black/60 border border-white/10 text-white font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#86868B] mb-1 font-medium">Graduation Year</label>
                <input
                  type="number"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-black/60 border border-white/10 text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Skills */}
          <div className="p-6 rounded-3xl bg-[#161617] border border-white/10 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-white/10 pb-3">
              <Award className="w-4 h-4 text-[#FF9F0A]" />
              <span>3. Technical Skills (40% Weight)</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {skills.map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs border border-white/15"
                >
                  <span className="font-semibold">{s.name}</span>
                  <span className="text-[10px] text-[#86868B] bg-black/40 px-1.5 py-0.2 rounded-full">
                    {s.level}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s.name)}
                    className="text-[#86868B] hover:text-white transition ml-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10 text-xs">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="Skill name (e.g. Python, Docker)"
                className="px-3.5 py-1.5 rounded-full bg-black/60 border border-white/10 text-white focus:outline-none"
              />
              <select
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(e.target.value)}
                className="px-3.5 py-1.5 rounded-full bg-black/60 border border-white/10 text-white focus:outline-none"
              >
                <option value="Beginner">Beginner (0.65x)</option>
                <option value="Intermediate">Intermediate (0.85x)</option>
                <option value="Advanced">Advanced (1.00x)</option>
                <option value="Expert">Expert (1.15x)</option>
              </select>
              <button
                type="button"
                onClick={() => handleAddSkill(newSkillName, newSkillLevel)}
                className="px-4 py-1.5 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skill</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {COMMON_SKILLS.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAddSkill(item)}
                  className="px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/15 text-[#86868B] hover:text-white text-[11px] border border-white/10 transition"
                >
                  + {item}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Preferences */}
          <div className="p-6 rounded-3xl bg-[#161617] border border-white/10 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-white/10 pb-3">
              <MapPin className="w-4 h-4 text-[#30D158]" />
              <span>4. Sector & Location Preferences</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#86868B] mb-2 uppercase">Preferred Sectors</label>
                <div className="flex flex-wrap gap-2">
                  {SECTORS_LIST.map((sec, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleSector(sec)}
                      className={`px-3 py-1.5 rounded-full text-xs transition border ${
                        preferredSectors.includes(sec)
                          ? 'bg-[#30D158]/20 text-[#30D158] border-[#30D158]/40 font-bold'
                          : 'bg-white/5 text-[#86868B] border-white/10 hover:text-white'
                      }`}
                    >
                      {preferredSectors.includes(sec) ? '✓ ' : '+ '}
                      {sec}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#86868B] mb-2 uppercase">Preferred Locations</label>
                <div className="flex flex-wrap gap-2">
                  {LOCATIONS_LIST.map((loc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleLocation(loc)}
                      className={`px-3 py-1.5 rounded-full text-xs transition border ${
                        preferredLocations.includes(loc)
                          ? 'bg-[#2997FF]/20 text-[#2997FF] border-[#2997FF]/40 font-bold'
                          : 'bg-white/5 text-[#86868B] border-white/10 hover:text-white'
                      }`}
                    >
                      {preferredLocations.includes(loc) ? '✓ ' : '+ '}
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 5. Resume */}
          <div className="p-6 rounded-3xl bg-[#161617] border border-white/10 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-white/10 pb-3">
              <FileText className="w-4 h-4 text-[#64D2FF]" />
              <span>5. Candidate Resume & Bio</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-dashed border-white/20 rounded-3xl p-6 text-center bg-black/40">
                <FileText className="w-8 h-8 text-[#86868B] mx-auto mb-2" />
                <div className="text-xs text-slate-300 font-semibold mb-2">
                  {profile?.resume_filename ? (
                    <span className="text-[#30D158] font-bold">Uploaded: {profile.resume_filename}</span>
                  ) : (
                    <span>No resume uploaded yet</span>
                  )}
                </div>
                <label className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer border border-white/15 transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingResume ? 'Uploading...' : 'Choose Resume (PDF/DOCX)'}</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleResumeUpload}
                    className="hidden"
                    disabled={uploadingResume}
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868B] mb-1.5">Statement of Purpose</label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your career goals and what you hope to achieve during the PM Internship Scheme..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#2997FF] resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-bold text-xs transition shadow-lg flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile & Recalculate Compatibility'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
