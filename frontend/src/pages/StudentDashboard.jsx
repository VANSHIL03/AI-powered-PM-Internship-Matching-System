import React, { useState, useEffect } from 'react';
import { studentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ScoreBreakdownModal from '../components/ScoreBreakdownModal';
import { 
  GraduationCap, 
  Award, 
  Building2, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  FileCheck, 
  ArrowUpRight, 
  AlertCircle,
  HelpCircle,
  Download,
  Search
} from 'lucide-react';

export default function StudentDashboard({ setActiveTab }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  // Modal State
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [profRes, matchRes, appsRes] = await Promise.all([
        studentsAPI.getProfile().catch(() => null),
        studentsAPI.getMatches().catch(() => ({ data: [] })),
        studentsAPI.getApplications().catch(() => ({ data: [] }))
      ]);

      if (profRes) setProfile(profRes.data);
      setMatches(matchRes?.data || []);
      setApplications(appsRes?.data || []);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (internshipId) => {
    setApplyingId(internshipId);
    setActionMessage('');
    try {
      const res = await studentsAPI.applyInternship(internshipId);
      setActionMessage(res.data.message || 'Application submitted successfully!');
      loadDashboard();
    } catch (err) {
      setActionMessage(err.response?.data?.detail || 'Application submission failed.');
    } finally {
      setApplyingId(null);
    }
  };

  const handleOpenBreakdown = (match) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F2A4A] mr-3"></div>
        <span>Loading student portal dashboard...</span>
      </div>
    );
  }

  const isAllocated = profile?.allocation_status === 'ALLOCATED' && profile?.allocated_internship;
  const allocated = profile?.allocated_internship;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Welcome & Overview Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
              Verified Candidate
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ID: <strong className="text-slate-800">{profile?.registration_number || 'PMIS-2026'}</strong>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Category: <strong className="text-slate-800">{profile?.category || 'GEN'}</strong>
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            Welcome, {profile?.full_name || user?.full_name || 'Candidate'}!
          </h2>
          <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3 mt-1">
            <span>{profile?.degree} ({profile?.field_of_study})</span>
            <span>•</span>
            <span>CGPA: <strong className="text-slate-900">{profile?.cgpa_percentage}</strong></span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{profile?.city}, {profile?.state}</span>
            </span>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('student-profile')}
          className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition shadow-xs flex items-center space-x-1.5"
        >
          <span>Edit Profile & Skills</span>
          <ArrowUpRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="text-blue-500 hover:text-blue-800">
            ✕
          </button>
        </div>
      )}

      {/* ALLOCATION STATUS BANNER */}
      {isAllocated ? (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-xl border border-emerald-700 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-bold tracking-wide uppercase border border-emerald-400/40">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Official Internship Allotment Confirmed</span>
              </div>
              <h3 className="text-2xl font-black text-white">
                {allocated.title}
              </h3>
              <div className="text-sm font-semibold text-emerald-100 flex flex-wrap items-center gap-3">
                <span className="flex items-center space-x-1">
                  <Building2 className="w-4 h-4 text-emerald-300" />
                  <span>{allocated.company_name}</span>
                </span>
                <span>•</span>
                <span>{allocated.sector}</span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4 text-emerald-300" />
                  <span>{allocated.is_remote ? 'Remote' : allocated.location}</span>
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 leading-relaxed pt-1">
                Congratulations! You have been allocated an internship under the PM Internship Scheme. Your compatibility score was calculated at <strong>{profile.allocated_score}%</strong> by the AI optimization engine.
              </p>
            </div>

            <div className="flex flex-col items-center sm:items-end justify-center bg-white/10 p-5 rounded-2xl border border-white/20 backdrop-blur-xs min-w-[200px] text-center sm:text-right">
              <span className="text-[11px] uppercase tracking-wider text-emerald-200 font-bold">
                Monthly Stipend
              </span>
              <span className="text-2xl font-black text-amber-300 my-0.5">
                ₹{allocated.stipend_amount?.toLocaleString('en-IN')}/mo
              </span>
              <span className="text-xs text-emerald-100 font-medium mb-3">
                Duration: {allocated.duration_months} Months
              </span>
              <button
                onClick={() => alert(`Official Allotment Letter for ${profile.full_name}:\n\nRole: ${allocated.title}\nEnterprise: ${allocated.company_name}\nLocation: ${allocated.location}\nStipend: ₹${allocated.stipend_amount}/month\nAllocation Score: ${profile.allocated_score}%\nRef: ${profile.registration_number}\n\nSigned by National Allocation Director.`)}
                className="w-full px-4 py-2 rounded-xl bg-white text-emerald-950 font-bold text-xs hover:bg-emerald-50 transition shadow-sm flex items-center justify-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Allotment Letter</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Status: In National Allocation Pool (Unallocated)</span>
            </div>
            <p className="text-xs text-amber-800 max-w-3xl leading-relaxed">
              Your profile is currently evaluated in the matching pool. The allocation algorithm runs constraint-aware optimization to match you with top compatible opportunities.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('ai-matching')}
            className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition shadow-xs flex items-center space-x-1 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Check Compatibility Matrix</span>
          </button>
        </div>
      )}

      {/* Recommended Opportunities Ranked by Compatibility */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>AI Ranked Internship Recommendations</span>
            </h3>
            <p className="text-xs text-slate-500">
              Personalized compatibility scores (0-100) computed in real-time based on your skills, preferences, and qualifications.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('internships')}
            className="text-xs font-bold text-[#0F2A4A] hover:underline flex items-center space-x-1"
          >
            <span>View All Vacancies</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {matches.slice(0, 6).map((item) => {
            const hasApplied = applications.some(a => a.internship_id === item.internship_id);
            return (
              <div 
                key={item.internship_id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {item.sector}
                    </span>
                    
                    {/* Compatibility Score Pill */}
                    <button
                      onClick={() => handleOpenBreakdown(item)}
                      title="Click to view explainable breakdown"
                      className={`px-2.5 py-1 rounded-full text-xs font-black border transition flex items-center space-x-1 ${
                        item.total_score >= 80 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                          : item.total_score >= 65
                          ? 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100'
                          : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{Math.round(item.total_score)}% Match</span>
                    </button>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 line-clamp-1">
                    {item.internship_title}
                  </h4>
                  <div className="text-xs font-semibold text-slate-600 mb-2">
                    {item.company_name}
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-500 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.is_remote ? 'Remote' : item.location}</span>
                    <span>•</span>
                    <span className="font-bold text-emerald-700">₹{item.stipend_amount?.toLocaleString('en-IN')}/mo</span>
                  </div>

                  {/* Matched skills summary */}
                  <div className="mb-4">
                    <div className="text-[11px] font-semibold text-slate-500 mb-1">Skills Matched:</div>
                    <div className="flex flex-wrap gap-1">
                      {item.skills_matched.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="text-[10px] font-medium bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">
                          {s}
                        </span>
                      ))}
                      {item.skills_matched.length > 3 && (
                        <span className="text-[10px] text-slate-400">+{item.skills_matched.length - 3} more</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenBreakdown(item)}
                    className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
                  >
                    View Breakdown
                  </button>

                  <button
                    onClick={() => handleApply(item.internship_id)}
                    disabled={hasApplied || applyingId === item.internship_id || !item.eligible}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                      hasApplied 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : !item.eligible
                        ? 'bg-rose-50 text-rose-600 cursor-not-allowed border border-rose-200'
                        : 'bg-[#0F2A4A] text-white hover:bg-[#0B1E36]'
                    }`}
                  >
                    <span>{hasApplied ? 'Applied' : !item.eligible ? 'Ineligible' : 'Apply Now'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Applied Internships History */}
      {applications.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <span>My Application Submissions ({applications.length})</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Internship Title</th>
                  <th className="py-2.5 px-3">Company</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Stipend</th>
                  <th className="py-2.5 px-3">Compatibility</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-bold text-slate-900">{app.title}</td>
                    <td className="py-3 px-3 text-slate-700">{app.company_name}</td>
                    <td className="py-3 px-3 text-slate-600">{app.is_remote ? 'Remote' : app.location}</td>
                    <td className="py-3 px-3 font-semibold text-emerald-700">₹{app.stipend_amount?.toLocaleString('en-IN')}/mo</td>
                    <td className="py-3 px-3">
                      <span className="font-extrabold text-slate-900">{Math.round(app.match_score)}%</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Explainable Modal */}
      <ScoreBreakdownModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedMatch}
      />
    </div>
  );
}
