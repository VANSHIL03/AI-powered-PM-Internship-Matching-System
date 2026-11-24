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
  ShieldCheck
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
        description: `Hands-on 6-month industry internship in ${newSector} at ${profile?.company_name || 'Enterprise'}.`,
        location: newLocation,
        is_remote: newIsRemote,
        duration_months: parseInt(newDuration),
        stipend_amount: parseInt(newStipend),
        seats_total: parseInt(newSeats),
        min_cgpa: parseFloat(newMinCgpa),
        required_degree: ["B.Tech / B.E.", "MCA"],
        required_skills: reqSkillsList,
        preferred_skills: prefSkillsList,
        category_reservations: reservations
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
      <div className="flex items-center justify-center p-20 text-slate-500 bg-[#000000] min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2997FF] mr-3"></div>
        <span>Loading enterprise portal...</span>
      </div>
    );
  }

  const totalSeatsSum = internships.reduce((acc, i) => acc + i.seats_total, 0);

  return (
    <div className="bg-[#000000] text-white min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#161617] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF9F0A] bg-[#FF9F0A]/15 px-3 py-0.5 rounded-full border border-[#FF9F0A]/30 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Partner Enterprise</span>
              </span>
              <span className="text-xs text-[#86868B]">
                HQ: <strong className="text-white">{profile?.hq_location}</strong>
              </span>
              <span className="text-xs text-[#86868B]">
                Sector: <strong className="text-white">{profile?.industry_sector}</strong>
              </span>
            </div>
            <h1 className="text-3xl font-black apple-text-gradient mt-1">
              {profile?.company_name || user?.full_name || 'Enterprise Portal'}.
            </h1>
            <p className="text-xs text-[#86868B]">
              Define vacancy requirements, monitor seat allocation, and inspect AI-ranked candidate pools.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold transition flex items-center space-x-1.5 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Internship</span>
          </button>
        </div>

        {/* Bento Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-3xl bg-[#161617] border border-white/10">
            <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider block">Opportunities</span>
            <div className="text-3xl font-black text-white mt-1">{internships.length}</div>
            <span className="text-xs text-[#86868B]">Active Roles</span>
          </div>

          <div className="p-6 rounded-3xl bg-[#161617] border border-white/10">
            <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider block">Total Seats</span>
            <div className="text-3xl font-black text-[#2997FF] mt-1">{totalSeatsSum} Seats</div>
            <span className="text-xs text-[#2997FF]">Approved Capacity</span>
          </div>

          <div className="p-6 rounded-3xl bg-[#161617] border border-white/10">
            <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider block">Allocated Interns</span>
            <div className="text-3xl font-black text-[#30D158] mt-1">{allocatedInterns.length} Placed</div>
            <span className="text-xs text-[#30D158]">Matched by OR-Tools</span>
          </div>

          <div className="p-6 rounded-3xl bg-[#161617] border border-white/10">
            <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider block">Capacity Fill Rate</span>
            <div className="text-3xl font-black text-[#BF5AF2] mt-1">
              {totalSeatsSum > 0 ? Math.round((allocatedInterns.length / totalSeatsSum) * 100) : 0}%
            </div>
            <span className="text-xs text-[#BF5AF2]">Optimal Utilization</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 space-x-6">
          <button
            onClick={() => setActiveTab('postings')}
            className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'postings'
                ? 'border-white text-white font-bold'
                : 'border-transparent text-[#86868B] hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Internship Postings ({internships.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('allocated')}
            className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'allocated'
                ? 'border-[#30D158] text-[#30D158] font-bold'
                : 'border-transparent text-[#86868B] hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Officially Allocated Interns ({allocatedInterns.length})</span>
          </button>
        </div>

        {/* Postings Table */}
        {activeTab === 'postings' && (
          <div className="bg-[#161617] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Active Vacancies & Candidate Pool</h3>
              <span className="text-xs text-[#86868B]">Click "Review Candidates" to inspect AI compatibility rankings</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-black/40 text-[#86868B] font-semibold uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Role Title</th>
                    <th className="py-3 px-4">Sector</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Capacity</th>
                    <th className="py-3 px-4">Stipend</th>
                    <th className="py-3 px-4">Min CGPA</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {internships.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition">
                      <td className="py-3.5 px-4 font-bold text-white">{item.title}</td>
                      <td className="py-3.5 px-4 text-[#86868B]">{item.sector}</td>
                      <td className="py-3.5 px-4 text-[#86868B]">{item.is_remote ? 'Remote' : item.location}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white">{item.seats_allocated}</span>
                        <span className="text-[#86868B]"> / {item.seats_total} filled</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#30D158]">₹{item.stipend_amount?.toLocaleString('en-IN')}/mo</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-300">{item.min_cgpa}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleReviewCandidates(item)}
                          className="px-3.5 py-1.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold transition text-[11px] inline-flex items-center space-x-1"
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
          <div className="bg-[#161617] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Assigned Student Roster</h3>
              <p className="text-xs text-[#86868B]">These candidates were assigned to your company by the national OR-Tools optimization engine.</p>
            </div>

            {allocatedInterns.length === 0 ? (
              <div className="p-16 text-center text-[#86868B] text-xs">
                <span>No candidates allocated yet. Once an administrator approves an allocation run, confirmed interns will appear here.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-black/40 text-[#86868B] font-semibold uppercase tracking-wider border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">Candidate Name</th>
                      <th className="py-3 px-4">Assigned Internship</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Degree & CGPA</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4 text-right">Match Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allocatedInterns.map((intern) => (
                      <tr key={intern.student_id} className="hover:bg-white/5">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{intern.full_name}</div>
                          <div className="text-[11px] text-[#86868B]">{intern.registration_number}</div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-300">{intern.internship_title}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white">
                            {intern.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#86868B]">
                          {intern.degree} (CGPA: {intern.cgpa})
                        </td>
                        <td className="py-3.5 px-4 text-[#86868B]">
                          <div>{intern.email}</div>
                          <div className="text-[11px] text-slate-500">{intern.phone}</div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-[#30D158]/20 text-[#30D158] border border-[#30D158]/30">
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
          <div className="p-6 sm:p-8 rounded-3xl bg-[#161617] border border-[#2997FF]/30 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2997FF] bg-[#2997FF]/15 px-3 py-0.5 rounded-full border border-[#2997FF]/30">
                  Candidate Pool Evaluation
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  {selectedInternship.title}
                </h3>
                <div className="text-xs text-[#86868B] mt-0.5">
                  Seats: <strong className="text-white">{selectedInternship.seats_total}</strong> • Min CGPA: <strong className="text-white">{selectedInternship.min_cgpa}</strong> • Skills: {selectedInternship.required_skills?.join(', ')}
                </div>
              </div>

              <button
                onClick={() => { setSelectedInternship(null); setCandidatesData(null); }}
                className="p-2 rounded-full text-[#86868B] hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingCandidates ? (
              <div className="py-16 text-center text-slate-500 text-xs">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2997FF] mx-auto mb-3"></div>
                <span>Computing candidate compatibility rankings...</span>
              </div>
            ) : candidatesData ? (
              <div className="space-y-3">
                <div className="text-xs text-[#86868B] flex items-center justify-between">
                  <span>Evaluated {candidatesData.candidates.length} Registered Candidates</span>
                  <span className="text-[#30D158] font-medium">Sorted by AI Compatibility</span>
                </div>

                <div className="max-h-[500px] overflow-y-auto divide-y divide-white/5 border border-white/10 rounded-2xl bg-black/40">
                  {candidatesData.candidates.slice(0, 15).map((cand) => (
                    <div key={cand.student_id} className="p-4 hover:bg-white/5 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-sm">{cand.full_name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-white/10 text-white">
                            {cand.category}
                          </span>
                          {!cand.compatibility.eligible && (
                            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-rose-500/20 text-rose-400">
                              Ineligible
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#86868B]">
                          {cand.degree} ({cand.field_of_study}) • CGPA: <strong className="text-white">{cand.cgpa_percentage}</strong> • {cand.city}, {cand.state}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 sm:text-right">
                        <div className="text-right">
                          <div className="text-[10px] text-[#86868B] uppercase">Score</div>
                          <div className="text-base font-black text-white">
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
                          className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
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
            <div className="bg-[#161617] text-white rounded-3xl border border-white/15 max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-lg font-bold text-white">Post New Internship Opportunity</h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-[#86868B] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateInternship} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#86868B] mb-1 font-medium">Opportunity Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Cloud Security Analyst Intern"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-black/60 border border-white/10 text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#86868B] mb-1 font-medium">Sector</label>
                    <select
                      value={newSector}
                      onChange={(e) => setNewSector(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-black/60 border border-white/10 text-white focus:outline-none"
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
                    <label className="block text-[#86868B] mb-1 font-medium">Location</label>
                    <input
                      type="text"
                      required
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g. Bengaluru"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-black/60 border border-white/10 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[#86868B] mb-1 font-medium">Seats</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newSeats}
                      onChange={(e) => setNewSeats(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-black/60 border border-white/10 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#86868B] mb-1 font-medium">Stipend (₹)</label>
                    <input
                      type="number"
                      min="5000"
                      step="1000"
                      required
                      value={newStipend}
                      onChange={(e) => setNewStipend(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-black/60 border border-white/10 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#86868B] mb-1 font-medium">Min CGPA</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newMinCgpa}
                      onChange={(e) => setNewMinCgpa(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-black/60 border border-white/10 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#86868B] mb-1 font-medium">Required Skills (Comma-separated)</label>
                  <input
                    type="text"
                    value={newReqSkills}
                    onChange={(e) => setNewReqSkills(e.target.value)}
                    placeholder="Python, React, SQL"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-black/60 border border-white/10 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#86868B] mb-1 font-medium">Preferred Skills (Comma-separated)</label>
                  <input
                    type="text"
                    value={newPrefSkills}
                    onChange={(e) => setNewPrefSkills(e.target.value)}
                    placeholder="Docker, AWS, Git"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-black/60 border border-white/10 text-white focus:outline-none"
                  />
                </div>

                {/* Quotas */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <span className="block font-bold text-white uppercase text-[10px] tracking-wider">
                    Category Quota Allocation (Demo Constraints)
                  </span>
                  <div className="grid grid-cols-5 gap-2">
                    {['GEN', 'OBC', 'SC', 'ST', 'EWS'].map((c, i) => (
                      <div key={c}>
                        <label className="text-[10px] text-[#86868B] block">{c}</label>
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

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-full border border-white/15 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2 rounded-full bg-[#0071E3] text-white font-bold hover:bg-[#0077ED]"
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
