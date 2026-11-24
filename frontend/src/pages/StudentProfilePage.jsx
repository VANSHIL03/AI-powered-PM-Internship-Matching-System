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
  AlertCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import OfficialApplicationModal from '../components/OfficialApplicationModal';

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

  // Resume Upload & AI Matches
  const [uploadingResume, setUploadingResume] = useState(false);
  const [aiMatches, setAiMatches] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleAddSkill = (skillName, skillLevel = "Intermediate") => {
    if (!skillName.trim()) return;
    const exists = skills.some(s => s.name.toLowerCase() === skillName.trim().toLowerCase());
    if (exists) return;

    setSkills([...skills, { name: skillName.trim(), level: skillLevel }]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (skillName) => {
    setSkills(skills.filter(s => s.name !== skillName));
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
      setMessage(res.data.message || `Resume '${res.data.filename}' uploaded and analyzed successfully!`);
      
      if (res.data.extracted_profile) {
        const ep = res.data.extracted_profile;
        if (ep.skills && ep.skills.length > 0) setSkills(ep.skills);
        if (ep.cgpa_percentage && ep.cgpa_percentage > 4.0) setCgpa(ep.cgpa_percentage);
        if (ep.degree) setDegree(ep.degree);
        if (ep.field_of_study) setFieldOfStudy(ep.field_of_study);
        if (ep.experience_months) setExperienceMonths(ep.experience_months);
        if (ep.projects_count) setProjectsCount(ep.projects_count);
      }
      if (res.data.matches) {
        setAiMatches(res.data.matches);
      }
      loadProfile();
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Resume upload failed.');
    } finally {
      setUploadingResume(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-[#94A3B8] space-y-3 font-sans">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#00D4FF] animate-spin"></div>
        <span>Loading profile credentials...</span>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 space-y-10 font-sans selection:bg-[#7C3AED] selection:text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#00D4FF] bg-[#00D4FF]/10 px-3 py-0.5 rounded-full border border-[#00D4FF]/25">
                Candidate Profile
              </span>
              <span className="text-xs text-[#94A3B8]">
                Registration: <strong className="text-[#F8FAFC]">{profile?.registration_number}</strong>
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
              Profile & Competencies.
            </h1>
            <p className="text-xs text-[#94A3B8]">
              Keep your technical skills and academic credentials updated. The AI matching engine evaluates these parameters in real time.
            </p>
          </div>

          <div className={`px-4 py-1.5 rounded-full text-xs font-bold border shrink-0 ${
            profile?.allocation_status === 'ALLOCATED'
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
          }`}>
            Status: {profile?.allocation_status || 'UNALLOCATED'}
          </div>
        </div>

        {message && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          
          {/* 1. Demographics */}
          <div className="glass-panel p-6 sm:p-7 space-y-4">
            <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center space-x-2 border-b border-white/10 pb-3">
              <User className="w-4 h-4 text-[#00D4FF]" />
              <span>1. Demographics & Category</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[#94A3B8] mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-[#F8FAFC] focus:outline-none focus:border-[#00D4FF]"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1 font-medium">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-[#F8FAFC] focus:outline-none focus:border-[#00D4FF]"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1 font-medium">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-[#F8FAFC] focus:outline-none focus:border-[#00D4FF]"
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
                <label className="block text-[#94A3B8] mb-1 font-medium">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-[#F8FAFC] focus:outline-none focus:border-[#00D4FF]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1 font-medium">Current City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-[#F8FAFC] focus:outline-none focus:border-[#00D4FF]"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1 font-medium">Home State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-[#F8FAFC] focus:outline-none focus:border-[#00D4FF]"
                />
              </div>
            </div>
          </div>

          {/* 2. Education & Eligibility */}
          <div className="glass-panel p-6 sm:p-7 space-y-4">
            <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center space-x-2 border-b border-white/10 pb-3">
              <GraduationCap className="w-4 h-4 text-[#C084FC]" />
              <span>2. Academic Qualifications (Hard Constraints)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-[#94A3B8] mb-1 font-medium">Degree</label>
                <select
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-[#F8FAFC] focus:outline-none focus:border-[#00D4FF]"
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
                <label className="block text-[#94A3B8] mb-1 font-medium">Field of Study</label>
                <input
                  type="text"
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-[#F8FAFC] focus:outline-none focus:border-[#00D4FF]"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1 font-medium">CGPA (Hard Barrier)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  required
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-[#F8FAFC] font-bold focus:outline-none focus:border-[#00D4FF]"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1 font-medium">Graduation Year</label>
                <input
                  type="number"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-[#F8FAFC] focus:outline-none focus:border-[#00D4FF]"
                />
              </div>
            </div>
          </div>

          {/* 3. Skills */}
          <div className="glass-panel p-6 sm:p-7 space-y-4">
            <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center space-x-2 border-b border-white/10 pb-3">
              <Award className="w-4 h-4 text-amber-400" />
              <span>3. Technical Skills (40% Weight)</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {skills.map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] text-[#F8FAFC] text-xs border border-white/15"
                >
                  <span className="font-semibold">{s.name}</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {s.level}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s.name)}
                    className="text-[#94A3B8] hover:text-white transition ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/10 text-xs">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="Skill name (e.g. Python, Docker)"
                className="px-4 py-2 rounded-full bg-black/40 border border-white/10 text-[#F8FAFC] focus:outline-none focus:border-[#00D4FF]"
              />
              <select
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(e.target.value)}
                className="px-3.5 py-2 rounded-full bg-black/40 border border-white/10 text-[#F8FAFC] focus:outline-none"
              >
                <option value="Beginner">Beginner (0.65x)</option>
                <option value="Intermediate">Intermediate (0.85x)</option>
                <option value="Advanced">Advanced (1.00x)</option>
                <option value="Expert">Expert (1.15x)</option>
              </select>
              <button
                type="button"
                onClick={() => handleAddSkill(newSkillName, newSkillLevel)}
                className="btn-primary-gradient px-4 py-2 rounded-full text-xs font-semibold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skill</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {COMMON_SKILLS.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAddSkill(item)}
                  className="px-3 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.08] text-[#94A3B8] hover:text-[#F8FAFC] text-[11px] border border-white/10 transition"
                >
                  + {item}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Preferences */}
          <div className="glass-panel p-6 sm:p-7 space-y-4">
            <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center space-x-2 border-b border-white/10 pb-3">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>4. Sector & Location Preferences</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#94A3B8] mb-2 uppercase">Preferred Sectors</label>
                <div className="flex flex-wrap gap-2">
                  {SECTORS_LIST.map((sec, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleSector(sec)}
                      className={`px-3.5 py-1.5 rounded-full text-xs transition border ${
                        preferredSectors.includes(sec)
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold'
                          : 'bg-white/[0.03] text-[#94A3B8] border-white/10 hover:text-white'
                      }`}
                    >
                      {preferredSectors.includes(sec) ? '✓ ' : '+ '}
                      {sec}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#94A3B8] mb-2 uppercase">Preferred Locations</label>
                <div className="flex flex-wrap gap-2">
                  {LOCATIONS_LIST.map((loc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleLocation(loc)}
                      className={`px-3.5 py-1.5 rounded-full text-xs transition border ${
                        preferredLocations.includes(loc)
                          ? 'bg-[#00D4FF]/15 text-[#00D4FF] border-[#00D4FF]/30 font-bold'
                          : 'bg-white/[0.03] text-[#94A3B8] border-white/10 hover:text-white'
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
          <div className="glass-panel p-6 sm:p-7 space-y-4">
            <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center space-x-2 border-b border-white/10 pb-3">
              <FileText className="w-4 h-4 text-[#00D4FF]" />
              <span>5. Candidate Resume & Bio</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-dashed border-white/20 rounded-2xl p-6 text-center bg-black/40 flex flex-col items-center justify-center space-y-2">
                <FileText className="w-8 h-8 text-[#94A3B8] mb-1" />
                <div className="text-xs text-slate-300 font-semibold">
                  {profile?.resume_filename ? (
                    <span className="text-emerald-400 font-bold">Uploaded: {profile.resume_filename}</span>
                  ) : (
                    <span>No resume uploaded yet</span>
                  )}
                </div>
                <label className="btn-glass-secondary px-4 py-2 rounded-full text-xs cursor-pointer space-x-1.5">
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
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Statement of Purpose</label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your career goals and what you hope to achieve during the PM Internship Scheme..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#00D4FF] resize-none"
                ></textarea>
              </div>
            </div>

            {/* AI Extracted Recommendations Banner */}
            {aiMatches.length > 0 && (
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-[#00D4FF]" />
                    <span className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
                      AI Matched PM Scheme Internships ({aiMatches.length})
                    </span>
                  </div>
                  <span className="text-[11px] text-[#94A3B8]">
                    Ranked by multi-criteria optimization
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {aiMatches.slice(0, 3).map((match, mIdx) => (
                    <div 
                      key={mIdx}
                      className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2 hover:border-[#00D4FF]/40 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#00D4FF] bg-[#00D4FF]/10 px-2 py-0.5 rounded border border-[#00D4FF]/20">
                          {Math.round(match.total_score)}% Match
                        </span>
                        <span className="text-[11px] font-bold text-emerald-400">
                          ₹{match.stipend_amount?.toLocaleString('en-IN')}/mo
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#F8FAFC] line-clamp-1">{match.internship_title}</h4>
                      <div className="text-[11px] text-[#94A3B8]">{match.company_name}</div>
                      
                      <div className="pt-2 flex items-center justify-between gap-2 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInternship(match);
                            setIsModalOpen(true);
                          }}
                          className="btn-glass-secondary px-2.5 py-1 rounded-full text-[10px]"
                        >
                          Assistant
                        </button>
                        <a
                          href={match.apply_url || "https://pminternship.mca.gov.in/"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary-gradient px-3 py-1 rounded-full text-[10px] font-bold text-white flex items-center space-x-1"
                        >
                          <span>Apply</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary-gradient px-8 py-3.5 rounded-full text-xs font-bold space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile & Recalculate Compatibility'}</span>
            </button>
          </div>
        </form>

        <OfficialApplicationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          internship={selectedInternship}
        />
      </div>
    </div>
  );
}
