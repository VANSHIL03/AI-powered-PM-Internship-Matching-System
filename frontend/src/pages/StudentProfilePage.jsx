import React, { useState, useEffect } from 'react';
import { studentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  GraduationCap, 
  BookOpen, 
  Award, 
  MapPin, 
  FileText, 
  Upload, 
  Plus, 
  X, 
  Check, 
  Sparkles,
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
  const [resumeFile, setResumeFile] = useState(null);
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
      <div className="flex items-center justify-center p-12 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F2A4A] mr-3"></div>
        <span>Loading student profile details...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
              Registration #{profile?.registration_number || 'PMIS-2026-PENDING'}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Category: <strong className="text-slate-800">{category}</strong>
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            Student Profile & Preference Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Keep your skills, CGPA, and preferences up to date. The AI matching engine uses these parameters for real-time compatibility calculation.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
            profile?.allocation_status === 'ALLOCATED'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-amber-50 text-amber-800 border-amber-300'
          }`}>
            Allocation Status: {profile?.allocation_status || 'UNALLOCATED'}
          </div>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Section 1: Demographics & Personal Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-blue-600" />
            <span>1. Personal & Reservation Demographics</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F2A4A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F2A4A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reservation Category (Demo Quotas)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F2A4A] focus:outline-none font-semibold bg-white"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F2A4A] focus:outline-none bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bengaluru"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F2A4A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Home State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Karnataka"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F2A4A] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Academic Qualifications & Eligibility */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-3">
            <GraduationCap className="w-4 h-4 text-purple-600" />
            <span>2. Academic Qualifications & Mandatory Eligibility</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Degree Program</label>
              <select
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F2A4A] focus:outline-none bg-white"
              >
                <option value="B.Tech / B.E.">B.Tech / B.E.</option>
                <option value="MCA">MCA</option>
                <option value="BCA">BCA</option>
                <option value="B.Sc Data Science">B.Sc Data Science</option>
                <option value="M.Tech">M.Tech</option>
                <option value="MBA">MBA</option>
                <option value="B.Com">B.Com</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Field of Study</label>
              <input
                type="text"
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F2A4A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                CGPA / Percentage (Hard Constraint)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                required
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F2A4A] focus:outline-none font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Graduation Year</label>
              <input
                type="number"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F2A4A] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Skills & Proficiency */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Award className="w-4 h-4 text-amber-500" />
            <span>3. Technical Skills & Proficiency (40% Matching Weight)</span>
          </h3>

          {/* Current Skills List */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Registered Skills</label>
            <div className="flex flex-wrap gap-2">
              {skills.map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-300"
                >
                  <span>{s.name}</span>
                  <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                    {s.level}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s.name)}
                    className="text-slate-400 hover:text-rose-600 transition ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {skills.length === 0 && (
                <span className="text-xs text-slate-400 italic">No skills registered yet. Add below!</span>
              )}
            </div>
          </div>

          {/* Add Skill Form */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Skill name (e.g. Python, React, SQL)"
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F2A4A] focus:outline-none"
            />
            <select
              value={newSkillLevel}
              onChange={(e) => setNewSkillLevel(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F2A4A] focus:outline-none bg-white"
            >
              <option value="Beginner">Beginner (0.65x)</option>
              <option value="Intermediate">Intermediate (0.85x)</option>
              <option value="Advanced">Advanced (1.00x)</option>
              <option value="Expert">Expert (1.15x)</option>
            </select>
            <button
              type="button"
              onClick={() => handleAddSkill(newSkillName, newSkillLevel)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Skill</span>
            </button>
          </div>

          {/* Quick Add Suggestions */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
              Quick Suggestions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SKILLS.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAddSkill(item)}
                  className="px-2 py-0.5 rounded-md bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-600 text-[11px] border border-slate-200 transition"
                >
                  + {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Preferences & Work Mode */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-3">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>4. Internship Sector & Location Preferences</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Preferred Sectors (Select all that interest you)
            </label>
            <div className="flex flex-wrap gap-2">
              {SECTORS_LIST.map((sec, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleSector(sec)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                    preferredSectors.includes(sec)
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-400 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {preferredSectors.includes(sec) ? '✓ ' : '+ '}
                  {sec}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Preferred Internship Locations
            </label>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS_LIST.map((loc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleLocation(loc)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                    preferredLocations.includes(loc)
                      ? 'bg-blue-50 text-blue-900 border-blue-400 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {preferredLocations.includes(loc) ? '✓ ' : '+ '}
                  {loc}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Work Mode</label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F2A4A] focus:outline-none bg-white"
              >
                <option value="Any">Any Mode (Onsite / Remote / Hybrid)</option>
                <option value="Remote">Remote Only</option>
                <option value="Onsite">Onsite Only</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Relevant Projects Count</label>
              <input
                type="number"
                min="0"
                max="20"
                value={projectsCount}
                onChange={(e) => setProjectsCount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F2A4A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prior Experience (Months)</label>
              <input
                type="number"
                min="0"
                max="36"
                value={experienceMonths}
                onChange={(e) => setExperienceMonths(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F2A4A] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Resume & Bio */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-3">
            <FileText className="w-4 h-4 text-teal-600" />
            <span>5. Resume Document & Candidate Bio</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Resume Document (PDF / DOCX)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:border-slate-400 transition bg-slate-50/50">
                <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <div className="text-xs text-slate-700 font-semibold mb-1">
                  {profile?.resume_filename ? (
                    <span className="text-emerald-700 font-bold">Current: {profile.resume_filename}</span>
                  ) : (
                    <span>No resume uploaded yet</span>
                  )}
                </div>
                <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-xs font-medium text-slate-800 cursor-pointer shadow-xs transition">
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>{uploadingResume ? 'Uploading...' : 'Choose File to Upload'}</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleResumeUpload}
                    className="hidden"
                    disabled={uploadingResume}
                  />
                </label>
                <div className="text-[10px] text-slate-500 mt-2">
                  Accepted formats: PDF, DOCX (Max: 10 MB)
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Short Bio / Statement of Purpose
              </label>
              <textarea
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Briefly describe your career objectives, domain passion, and what you hope to achieve during the PM Internship Scheme..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F2A4A] focus:outline-none resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-[#0F2A4A] hover:bg-[#0B1E36] text-white font-bold text-xs transition shadow-md flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Profile & Update Compatibility'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
