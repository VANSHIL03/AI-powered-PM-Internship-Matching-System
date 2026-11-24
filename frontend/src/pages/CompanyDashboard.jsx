import React, { useState, useEffect } from 'react';
import { companiesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ScoreBreakdownModal from '../components/ScoreBreakdownModal';
import { 
  Building2, 
  Plus, 
  Users, 
  MapPin, 
  Briefcase, 
  CheckCircle2, 
  X, 
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function CompanyDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [internships, setInternships] = useState([]);
  const [allocatedInterns, setAllocatedInterns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected Internship for Candidate Review
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [candidatesData, setCandidatesData] = useState(null);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  // Create Internship Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSector, setNewSector] = useState('Information Technology');
  const [newLocation, setNewLocation] = useState('Bengaluru');
  const [newIsRemote, setNewIsRemote] = useState(false);
  const [newSeats, setNewSeats] = useState(2);
  const [newDuration, setNewDuration] = useState(6);
  const [newStipend, setNewStipend] = useState(20000);
  const [newMinCgpa, setNewMinCgpa] = useState(7.0);
  const [newReqSkills, setNewReqSkills] = useState('Python, SQL');
  const [newPrefSkills, setNewPrefSkills] = useState('Docker, AWS');
  const [newGenSeats, setNewGenSeats] = useState(1);
  const [newObcSeats, setNewObcSeats] = useState(1);
  const [newScSeats, setNewScSeats] = useState(0);
  const [newStSeats, setNewStSeats] = useState(0);
  const [newEwsSeats, setNewEwsSeats] = useState(0);
  const [creating, setCreating] = useState(false);

  // Breakdown Modal State
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  // Active Tab: 'postings' or 'allocated'
  const [activeTab, setActiveTab] = useState('postings');

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    setLoading(true);
    try {
      const [profRes, internRes, allocRes] = await Promise.all([
        companiesAPI.getProfile().catch(() => null),
        companiesAPI.getInternships().catch(() => ({ data: [] })),
        companiesAPI.getAllocatedInterns().catch(() => ({ data: [] }))
      ]);

      if (profRes) setProfile(profRes.data);
      setInternships(internRes?.data || []);
      setAllocatedInterns(allocRes?.data || []);
    } catch (err) {
      console.error("Company dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewCandidates = async (internship) => {
    setSelectedInternship(internship);
    setLoadingCandidates(true);
    try {
      const res = await companiesAPI.getCandidates(internship.id);
      setCandidatesData(res.data);
    } catch (err) {
      console.error("Error loading candidates:", err);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleCreateInternship = async (e) => {
    e.preventDefault();
    setCreating(true);

    const reqSkillsList = newReqSkills.split(',').map(s => s.trim()).filter(Boolean);
    const prefSkillsList = newPrefSkills.split(',').map(s => s.trim()).filter(Boolean);

    const reservations = {
      GEN: parseInt(newGenSeats) || 0,
      OBC_NCL: parseInt(newObcSeats) || 0,
      SC: parseInt(newScSeats) || 0,
      ST: parseInt(newStSeats) || 0,
      EWS: parseInt(newEwsSeats) || 0
    };

    try {
      await companiesAPI.createInternship({
        title: newTitle,
        sector: newSector,
        location: newLocation,
        is_remote: newIsRemote,
        seats_total: parseInt(newSeats),
        duration_months: parseInt(newDuration),
        stipend_amount: parseFloat(newStipend),
        min_cgpa: parseFloat(newMinCgpa),
        required_skills: reqSkillsList,
        preferred_skills: prefSkillsList,
        reservations
      });

      setIsCreateModalOpen(false);
      setNewTitle('');
      loadCompanyData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create internship.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-[#94A3B8] space-y-3 font-sans">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#00D4FF] animate-spin"></div>
        <span>Loading corporate portal telemetry...</span>
      </div>
    );
  }

  const totalSeatsSum = internships.reduce((acc, i) => acc + i.seats_total, 0);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 space-y-10 font-sans selection:bg-[#7C3AED] selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-0.5 rounded-full border border-amber-500/20 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Partner Enterprise</span>
              </span>
              <span className="text-xs text-[#94A3B8]">
                HQ: <strong className="text-[#F8FAFC]">{profile?.hq_location}</strong>
              </span>
              <span className="text-xs text-[#94A3B8]">
                Sector: <strong className="text-[#F8FAFC]">{profile?.industry_sector}</strong>
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
              {profile?.company_name || user?.full_name || 'Enterprise Portal'}.
            </h1>
            <p className="text-xs text-[#94A3B8]">
              Define vacancy requirements, monitor seat allocation, and inspect AI-ranked candidate pools.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary-gradient px-6 py-3 rounded-full text-xs font-semibold space-x-2 shrink-0"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Post New Internship</span>
          </button>
        </div>

        {/* Bento Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-6 glass-panel-hover">
            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider block">Opportunities</span>
            <div className="text-3xl font-extrabold text-[#F8FAFC] mt-1">{internships.length}</div>
            <span className="text-xs text-[#94A3B8]">Active Roles</span>
          </div>

          <div className="glass-panel p-6 glass-panel-hover">
            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider block">Total Seats</span>
            <div className="text-3xl font-extrabold text-[#00D4FF] mt-1">{totalSeatsSum} Seats</div>
            <span className="text-xs text-[#00D4FF]">Approved Capacity</span>
          </div>

          <div className="glass-panel p-6 glass-panel-hover">
            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider block">Allocated Interns</span>
            <div className="text-3xl font-extrabold text-emerald-400 mt-1">{allocatedInterns.length} Placed</div>
            <span className="text-xs text-emerald-400 font-medium">Matched by OR-Tools</span>
          </div>

          <div className="glass-panel p-6 glass-panel-hover">
            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider block">Capacity Fill Rate</span>
            <div className="text-3xl font-extrabold text-[#C084FC] mt-1">
              {totalSeatsSum > 0 ? Math.round((allocatedInterns.length / totalSeatsSum) * 100) : 0}%
            </div>
            <span className="text-xs text-[#C084FC]">Optimal Utilization</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 space-x-6">
          <button
            onClick={() => setActiveTab('postings')}
            className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'postings'
                ? 'border-[#00D4FF] text-[#00D4FF] font-bold'
                : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Internship Postings ({internships.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('allocated')}
            className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'allocated'
                ? 'border-emerald-400 text-emerald-400 font-bold'
                : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Officially Allocated Interns ({allocatedInterns.length})</span>
          </button>
        </div>

        {/* Postings Table */}
        {activeTab === 'postings' && (
          <div className="glass-panel overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F8FAFC]">Active Vacancies & Candidate Pool</h3>
              <span className="text-xs text-[#94A3B8] hidden sm:inline">Click "Review Candidates" to inspect AI compatibility rankings</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-white/[0.02] text-[#94A3B8] font-semibold uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4">Role Title</th>
                    <th className="py-3.5 px-4">Sector</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Capacity</th>
                    <th className="py-3.5 px-4">Stipend</th>
                    <th className="py-3.5 px-4">Min CGPA</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {internships.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-4 px-4 font-bold text-[#F8FAFC]">{item.title}</td>
                      <td className="py-4 px-4 text-[#94A3B8]">{item.sector}</td>
                      <td className="py-4 px-4 text-[#94A3B8]">{item.is_remote ? 'Remote' : item.location}</td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-[#F8FAFC]">{item.seats_allocated}</span>
                        <span className="text-[#94A3B8]"> / {item.seats_total} filled</span>
                      </td>
                      <td className="py-4 px-4 font-bold text-emerald-400">₹{item.stipend_amount?.toLocaleString('en-IN')}/mo</td>
                      <td className="py-4 px-4 font-semibold text-slate-300">{item.min_cgpa}</td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleReviewCandidates(item)}
                          className="btn-primary-gradient px-4 py-1.5 rounded-full text-[11px] inline-flex items-center space-x-1.5"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Review Candidates</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Allocated Interns Table */}
        {activeTab === 'allocated' && (
          <div className="glass-panel overflow-hidden">
            <div className="p-5 border-b border-white/10">
              <h3 className="text-sm font-bold text-[#F8FAFC]">Assigned Student Roster</h3>
              <p className="text-xs text-[#94A3B8]">These candidates were assigned to your company by the national OR-Tools optimization engine.</p>
            </div>

            {allocatedInterns.length === 0 ? (
              <div className="p-16 text-center text-[#94A3B8] text-xs">
                <span>No candidates allocated yet. Once an administrator approves an allocation run, confirmed interns will appear here.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-white/[0.02] text-[#94A3B8] font-semibold uppercase tracking-wider border-b border-white/10">
                    <tr>
                      <th className="py-3.5 px-4">Candidate Name</th>
                      <th className="py-3.5 px-4">Assigned Internship</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Degree & CGPA</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4 text-right">Match Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allocatedInterns.map((intern) => (
                      <tr key={intern.student_id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-bold text-[#F8FAFC]">{intern.full_name}</div>
                          <div className="text-[11px] text-[#94A3B8]">{intern.registration_number}</div>
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-300">{intern.internship_title}</td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.04] text-[#F8FAFC] border border-white/10">
                            {intern.category}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-[#94A3B8]">
                          {intern.degree} (CGPA: {intern.cgpa})
                        </td>
                        <td className="py-4 px-4 text-[#94A3B8]">
                          <div>{intern.email}</div>
                          <div className="text-[11px] text-slate-500">{intern.phone}</div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            {Math.round(intern.score)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* CANDIDATE EVALUATION DRAWER */}
        {selectedInternship && (
          <div className="glass-panel p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00D4FF] bg-[#00D4FF]/10 px-3 py-0.5 rounded-full border border-[#00D4FF]/25">
                  Candidate Pool Evaluation
                </span>
                <h3 className="text-2xl font-black text-[#F8FAFC] mt-1">
                  {selectedInternship.title}
                </h3>
                <div className="text-xs text-[#94A3B8] mt-0.5">
                  Seats: <strong className="text-[#F8FAFC]">{selectedInternship.seats_total}</strong> • Min CGPA: <strong className="text-[#F8FAFC]">{selectedInternship.min_cgpa}</strong> • Skills: {selectedInternship.required_skills?.join(', ')}
                </div>
              </div>

              <button
                onClick={() => { setSelectedInternship(null); setCandidatesData(null); }}
                className="p-2 rounded-full text-[#94A3B8] hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingCandidates ? (
              <div className="py-16 text-center text-[#94A3B8] text-xs space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#00D4FF] animate-spin mx-auto"></div>
                <span>Computing candidate compatibility rankings...</span>
              </div>
            ) : candidatesData ? (
              <div className="space-y-3">
                <div className="text-xs text-[#94A3B8] flex items-center justify-between">
                  <span>Evaluated {candidatesData.candidates.length} Registered Candidates</span>
                  <span className="text-emerald-400 font-medium">Sorted by AI Compatibility</span>
                </div>

                <div className="max-h-[500px] overflow-y-auto divide-y divide-white/5 border border-white/10 rounded-2xl bg-black/40">
                  {candidatesData.candidates.slice(0, 15).map((cand) => (
                    <div key={cand.student_id} className="p-4 hover:bg-white/[0.04] transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-[#F8FAFC] text-sm">{cand.full_name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.04] text-[#F8FAFC]">
                            {cand.category}
                          </span>
                          {!cand.compatibility.eligible && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400">
                              Ineligible
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#94A3B8]">
                          {cand.degree} ({cand.field_of_study}) • CGPA: <strong className="text-[#F8FAFC]">{cand.cgpa_percentage}</strong> • {cand.city}, {cand.state}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 sm:text-right">
                        <div className="text-right">
                          <div className="text-[10px] text-[#94A3B8] uppercase">Score</div>
                          <div className="text-base font-black text-[#F8FAFC]">
                            {Math.round(cand.compatibility.total_score)}%
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedMatch({
                              ...cand.compatibility,
                              internship_title: selectedInternship.title,
                              company_name: profile?.company_name
                            });
                            setIsBreakdownOpen(true);
                          }}
                          className="btn-glass-secondary px-3.5 py-1.5 rounded-full text-xs font-semibold"
                        >
                          Explain
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* CREATE MODAL */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
            <div className="glass-panel text-[#F8FAFC] max-w-xl w-full p-6 sm:p-7 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-lg font-bold text-[#F8FAFC]">Post New Internship Opportunity</h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-[#94A3B8] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateInternship} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#94A3B8] mb-1 font-medium">Opportunity Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Cloud Security Analyst Intern"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-[#F8FAFC] focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#94A3B8] mb-1 font-medium">Sector</label>
                    <select
                      value={newSector}
                      onChange={(e) => setNewSector(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-[#F8FAFC] focus:outline-none"
                    >
                      <option value="Information Technology">Information Technology</option>
                      <option value="Green Energy">Green Energy</option>
                      <option value="Banking & FinTech">Banking & FinTech</option>
                      <option value="Healthcare & Pharma">Healthcare & Pharma</option>
                      <option value="Manufacturing & Infrastructure">Manufacturing & Infrastructure</option>
                      <option value="Automotive & Electric Vehicles">Automotive & Electric Vehicles</option>
                      <option value="Cybersecurity & Cloud">Cybersecurity & Cloud</option>
                      <option value="Public Policy & Gov-Tech">Public Policy & Gov-Tech</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#94A3B8] mb-1 font-medium">Location</label>
                    <input
                      type="text"
                      required
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g. Bengaluru"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-[#F8FAFC] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[#94A3B8] mb-1 font-medium">Seats</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newSeats}
                      onChange={(e) => setNewSeats(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-[#F8FAFC] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#94A3B8] mb-1 font-medium">Stipend (₹)</label>
                    <input
                      type="number"
                      min="5000"
                      step="1000"
                      required
                      value={newStipend}
                      onChange={(e) => setNewStipend(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-[#F8FAFC] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#94A3B8] mb-1 font-medium">Min CGPA</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newMinCgpa}
                      onChange={(e) => setNewMinCgpa(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-[#F8FAFC] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#94A3B8] mb-1 font-medium">Required Skills (Comma-separated)</label>
                  <input
                    type="text"
                    value={newReqSkills}
                    onChange={(e) => setNewReqSkills(e.target.value)}
                    placeholder="Python, React, SQL"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-[#F8FAFC] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#94A3B8] mb-1 font-medium">Preferred Skills (Comma-separated)</label>
                  <input
                    type="text"
                    value={newPrefSkills}
                    onChange={(e) => setNewPrefSkills(e.target.value)}
                    placeholder="Docker, AWS, Git"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-[#F8FAFC] focus:outline-none"
                  />
                </div>

                {/* Quotas */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <span className="block font-bold text-[#F8FAFC] uppercase text-[10px] tracking-wider">
                    Category Quota Allocation (Demo Constraints)
                  </span>
                  <div className="grid grid-cols-5 gap-2">
                    {['GEN', 'OBC', 'SC', 'ST', 'EWS'].map((c, i) => (
                      <div key={c}>
                        <label className="text-[10px] text-[#94A3B8] block">{c}</label>
                        <input
                          type="number"
                          min="0"
                          defaultValue={i === 0 ? 1 : 0}
                          className="w-full px-2 py-1 rounded-lg bg-black/60 border border-white/10 text-white text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="btn-glass-secondary px-5 py-2 rounded-full text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="btn-primary-gradient px-6 py-2 rounded-full text-xs font-bold"
                  >
                    {creating ? 'Creating...' : 'Publish'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

      <ScoreBreakdownModal
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
        data={selectedMatch}
      />
    </div>
  );
}
