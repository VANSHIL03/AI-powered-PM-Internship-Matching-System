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
  Award, 
  CheckCircle2, 
  ChevronRight, 
  Eye, 
  X, 
  FileText, 
  Sparkles,
  ShieldCheck,
  Search,
  Filter
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
      // Reset form
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
      <div className="flex items-center justify-center p-16 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F2A4A] mr-3"></div>
        <span>Loading company dashboard...</span>
      </div>
    );
  }

  const totalSeatsSum = internships.reduce((acc, i) => acc + i.seats_total, 0);
  const totalAllocatedSum = internships.reduce((acc, i) => acc + i.seats_allocated, 0);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Company Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Verified Partner Enterprise</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              HQ: <strong className="text-slate-800">{profile?.hq_location}</strong>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Sector: <strong className="text-slate-800">{profile?.industry_sector}</strong>
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            {profile?.company_name || user?.full_name || 'Enterprise Portal'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your internship opportunities, review AI-ranked candidate pools, and monitor allocated interns.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#0F2A4A] hover:bg-[#0B1E36] text-white text-xs font-bold transition shadow-sm flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Internship</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Opportunities</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{internships.length}</div>
          <span className="text-[11px] text-slate-500">Published on PMIS</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Seat Capacity</span>
          <div className="text-2xl font-black text-blue-700 mt-1">{totalSeatsSum} Seats</div>
          <span className="text-[11px] text-blue-600 font-semibold">Approved by Scheme</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Allocated Interns</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">{allocatedInterns.length} Placed</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Matched via OR-Tools</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Seat Fill Rate</span>
          <div className="text-2xl font-black text-purple-700 mt-1">
            {totalSeatsSum > 0 ? Math.round((allocatedInterns.length / totalSeatsSum) * 100) : 0}%
          </div>
          <span className="text-[11px] text-purple-600 font-semibold">Capacity Utilization</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveTab('postings')}
          className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 ${
            activeTab === 'postings'
              ? 'border-[#0F2A4A] text-[#0F2A4A]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>My Internship Postings ({internships.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('allocated')}
          className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 ${
            activeTab === 'allocated'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Officially Allocated Interns ({allocatedInterns.length})</span>
        </button>
      </div>

      {/* TAB 1: Internship Postings Table */}
      {activeTab === 'postings' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Internship Roles & Candidate Pool Management</h3>
            <span className="text-xs text-slate-500">Click "Review Candidates" to view AI compatibility ranking</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Role Title</th>
                  <th className="py-3 px-4">Sector</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Seats</th>
                  <th className="py-3 px-4">Stipend</th>
                  <th className="py-3 px-4">Min CGPA</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {internships.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500">ID: #{item.id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{item.sector}</td>
                    <td className="py-3.5 px-4 text-slate-600">{item.is_remote ? 'Remote' : item.location}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">{item.seats_allocated}</span>
                      <span className="text-slate-400"> / {item.seats_total} Filled</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">₹{item.stipend_amount?.toLocaleString('en-IN')}/mo</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{item.min_cgpa}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleReviewCandidates(item)}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 border border-blue-200 transition text-[11px] inline-flex items-center space-x-1"
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

      {/* TAB 2: Allocated Interns Table */}
      {activeTab === 'allocated' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Assigned Student Roster</h3>
              <p className="text-xs text-slate-500">These candidates were assigned to your company by the national OR-Tools optimization engine.</p>
            </div>
          </div>

          {allocatedInterns.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <span>No candidates allocated yet. Once the administrator publishes an allocation run, confirmed interns will appear here.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Candidate Name</th>
                    <th className="py-3 px-4">Assigned Internship</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Degree & CGPA</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Match Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allocatedInterns.map((intern) => (
                    <tr key={intern.student_id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{intern.full_name}</div>
                        <div className="text-[11px] text-slate-500">{intern.registration_number}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{intern.internship_title}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {intern.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {intern.degree} (CGPA: {intern.cgpa})
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{intern.email}</div>
                        <div className="text-[11px] text-slate-400">{intern.phone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
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

      {/* CANDIDATE EVALUATION DRAWER / MODAL */}
      {selectedInternship && (
        <div className="bg-white rounded-2xl border border-blue-200 shadow-md p-6 space-y-4">
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Candidate Pool Evaluation
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                {selectedInternship.title}
              </h3>
              <div className="text-xs text-slate-500 mt-0.5">
                Total Seats: <strong>{selectedInternship.seats_total}</strong> • Min CGPA: <strong>{selectedInternship.min_cgpa}</strong> • Required Skills: {selectedInternship.required_skills?.join(', ')}
              </div>
            </div>

            <button
              onClick={() => { setSelectedInternship(null); setCandidatesData(null); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loadingCandidates ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <span>Computing compatibility rankings across candidate pool...</span>
            </div>
          ) : candidatesData ? (
            <div className="space-y-3">
              <div className="text-xs text-slate-600 font-semibold flex items-center justify-between">
                <span>Evaluated {candidatesData.candidates.length} Registered Candidates (Ranked by Compatibility)</span>
                <span className="text-[11px] text-emerald-600 font-medium">Eligible candidates sorted highest to lowest</span>
              </div>

              <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                {candidatesData.candidates.slice(0, 15).map((cand) => (
                  <div key={cand.student_id} className="p-4 hover:bg-slate-50/70 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">{cand.full_name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {cand.category}
                        </span>
                        {!cand.compatibility.eligible && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-300">
                            Ineligible
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        {cand.degree} ({cand.field_of_study}) • CGPA: <strong>{cand.cgpa_percentage}</strong> • {cand.city}, {cand.state}
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {cand.skills?.slice(0, 4).map((s, idx) => (
                          <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {typeof s === 'object' ? s.name : s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 sm:text-right">
                      <div className="text-right">
                        <div className="text-xs text-slate-400 font-medium">Score</div>
                        <div className="text-base font-black text-slate-900">
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
                        className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
                      >
                        Explain Score
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* CREATE INTERNSHIP MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Post New Internship Opportunity</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInternship} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Opportunity Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Cloud Security Analyst Intern"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F2A4A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sector</label>
                  <select
                    value={newSector}
                    onChange={(e) => setNewSector(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
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
                  <label className="block font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Seats Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={newSeats}
                    onChange={(e) => setNewSeats(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Stipend (₹)</label>
                  <input
                    type="number"
                    min="5000"
                    step="1000"
                    required
                    value={newStipend}
                    onChange={(e) => setNewStipend(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Minimum CGPA (Hard)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    value={newMinCgpa}
                    onChange={(e) => setNewMinCgpa(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Required Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={newReqSkills}
                  onChange={(e) => setNewReqSkills(e.target.value)}
                  placeholder="Python, React, SQL"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preferred Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={newPrefSkills}
                  onChange={(e) => setNewPrefSkills(e.target.value)}
                  placeholder="Docker, AWS, Git"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              {/* Sample Reservation Quotas for Demo */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wider">
                  Illustrative Quota Seat Breakdown (Demo Constraints)
                </span>
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block">GEN</label>
                    <input
                      type="number"
                      min="0"
                      value={newGenSeats}
                      onChange={(e) => setNewGenSeats(e.target.value)}
                      className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">OBC</label>
                    <input
                      type="number"
                      min="0"
                      value={newObcSeats}
                      onChange={(e) => setNewObcSeats(e.target.value)}
                      className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">SC</label>
                    <input
                      type="number"
                      min="0"
                      value={newScSeats}
                      onChange={(e) => setNewScSeats(e.target.value)}
                      className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">ST</label>
                    <input
                      type="number"
                      min="0"
                      value={newStSeats}
                      onChange={(e) => setNewStSeats(e.target.value)}
                      className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">EWS</label>
                    <input
                      type="number"
                      min="0"
                      value={newEwsSeats}
                      onChange={(e) => setNewEwsSeats(e.target.value)}
                      className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-[#0F2A4A] text-white font-bold hover:bg-[#0B1E36]"
                >
                  {creating ? 'Creating...' : 'Publish Internship'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Breakdown Modal */}
      <ScoreBreakdownModal
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
        data={selectedMatch}
      />
    </div>
  );
}
