import React, { useState, useEffect } from 'react';
import { studentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ScoreBreakdownModal from '../components/ScoreBreakdownModal';
import { 
  Building2, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  FileCheck, 
  ArrowUpRight, 
  Download
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
      <div className="flex flex-col items-center justify-center p-24 text-[#94A3B8] space-y-3 font-sans">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#00D4FF] animate-spin"></div>
        <span>Loading candidate dashboard telemetry...</span>
      </div>
    );
  }

  const isAllocated = profile?.allocation_status === 'ALLOCATED' && profile?.allocated_internship;
  const allocated = profile?.allocated_internship;

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 space-y-10 font-sans selection:bg-[#7C3AED] selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Profile Overview Header in Glass Panel */}
        <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-0.5 rounded-full border border-emerald-500/20">
                Verified Candidate
              </span>
              <span className="text-xs text-[#94A3B8]">
                ID: <strong className="text-[#F8FAFC]">{profile?.registration_number || 'PMIS-2026'}</strong>
              </span>
              <span className="text-xs text-[#94A3B8]">
                Category: <strong className="text-[#F8FAFC]">{profile?.category || 'GEN'}</strong>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
              Welcome, {profile?.full_name || user?.full_name || 'Candidate'}.
            </h1>
            <div className="text-xs text-[#94A3B8] flex flex-wrap items-center gap-3 pt-0.5">
              <span>{profile?.degree} ({profile?.field_of_study})</span>
              <span>•</span>
              <span>CGPA: <strong className="text-[#F8FAFC]">{profile?.cgpa_percentage}</strong></span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile?.city}, {profile?.state}</span>
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('student-profile')}
            className="btn-glass-secondary px-5 py-2.5 rounded-full text-xs space-x-1.5 shrink-0"
          >
            <span>Edit Profile & Skills</span>
            <ArrowUpRight className="w-4 h-4 text-[#00D4FF]" />
          </button>
        </div>

        {actionMessage && (
          <div className="p-4 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage('')} className="text-white/60 hover:text-white">✕</button>
          </div>
        )}

        {/* ALLOCATION STATUS BANNER */}
        {isAllocated ? (
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-emerald-900/30 to-[#090A0F] border border-emerald-500/30 relative overflow-hidden shadow-2xl glass-panel">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide uppercase border border-emerald-500/40">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Official Internship Allotment Confirmed</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-[#F8FAFC]">
                  {allocated.title}
                </h2>
                <div className="text-sm font-semibold text-emerald-200 flex flex-wrap items-center gap-3">
                  <span className="flex items-center space-x-1">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span>{allocated.company_name}</span>
                  </span>
                  <span>•</span>
                  <span>{allocated.sector}</span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>{allocated.is_remote ? 'Remote' : allocated.location}</span>
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed pt-1">
                  Congratulations! You have been awarded an internship under the PM Internship Scheme. Your compatibility score was calculated at <strong className="text-emerald-400 font-bold">{profile.allocated_score}%</strong> by the Google OR-Tools optimization engine.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md min-w-[220px] text-center sm:text-right space-y-2.5">
                <span className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold block">
                  Monthly Stipend
                </span>
                <span className="text-3xl font-extrabold text-emerald-400 block">
                  ₹{allocated.stipend_amount?.toLocaleString('en-IN')}/mo
                </span>
                <span className="text-xs text-[#94A3B8] font-medium block">
                  Duration: {allocated.duration_months} Months
                </span>
                <button
                  onClick={() => alert(`Official Allotment Confirmation:\n\nCandidate: ${profile.full_name}\nRole: ${allocated.title}\nEnterprise: ${allocated.company_name}\nLocation: ${allocated.location}\nStipend: ₹${allocated.stipend_amount}/mo\nCompatibility Score: ${profile.allocated_score}%\nRef: ${profile.registration_number}\n\nSigned by National Allocation Director.`)}
                  className="btn-primary-gradient w-full mt-2 py-2 rounded-full text-xs space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Allotment Letter</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                <Clock className="w-4 h-4" />
                <span>Status: In National Allocation Pool</span>
              </div>
              <p className="text-xs text-[#94A3B8] max-w-2xl leading-relaxed">
                Your profile is active in the candidate pool. The optimization solver runs constraint-aware Integer Linear Programming to find the highest welfare match.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('ai-matching')}
              className="btn-primary-gradient px-5 py-2.5 rounded-full text-xs font-semibold shrink-0"
            >
              Check Compatibility Matrix
            </button>
          </div>
        )}

        {/* AI Recommendations */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-[#F8FAFC]">
                Personalized AI Recommendations
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Ranked by multi-criteria compatibility against your verified skills and preferences.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('internships')}
              className="text-xs font-semibold text-[#00D4FF] hover:underline flex items-center space-x-1"
            >
              <span>View All Vacancies</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.slice(0, 6).map((item) => {
              const hasApplied = applications.some(a => a.internship_id === item.internship_id);
              return (
                <div 
                  key={item.internship_id}
                  className="bento-card-interactive p-6 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#00D4FF] bg-[#00D4FF]/10 px-2.5 py-0.5 rounded-full border border-[#00D4FF]/25">
                        {item.sector}
                      </span>
                      
                      <button
                        onClick={() => handleOpenBreakdown(item)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-all flex items-center space-x-1 ${
                          item.total_score >= 80 
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                            : item.total_score >= 65
                            ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25'
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{Math.round(item.total_score)}% Match</span>
                      </button>
                    </div>

                    <h4 className="text-base font-bold text-[#F8FAFC] group-hover:text-[#00D4FF] transition-colors line-clamp-1">
                      {item.internship_title}
                    </h4>
                    <div className="text-xs text-[#94A3B8] font-medium mb-3">
                      {item.company_name}
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-[#94A3B8] mb-4">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.is_remote ? 'Remote' : item.location}</span>
                      <span>•</span>
                      <span className="font-bold text-emerald-400">₹{item.stipend_amount?.toLocaleString('en-IN')}/mo</span>
                    </div>

                    <div className="mb-4">
                      <div className="text-[10px] font-semibold text-[#94A3B8] uppercase mb-1.5">Skills Matched:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.skills_matched.slice(0, 3).map((s, idx) => (
                          <span key={idx} className="text-[10px] font-medium bg-white/[0.04] text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenBreakdown(item)}
                      className="text-xs text-[#94A3B8] hover:text-[#F8FAFC] font-semibold transition-colors"
                    >
                      Explain Score
                    </button>

                    <button
                      onClick={() => handleApply(item.internship_id)}
                      disabled={hasApplied || applyingId === item.internship_id || !item.eligible}
                      className={
                        hasApplied
                          ? "px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 text-slate-500 cursor-not-allowed"
                          : !item.eligible
                          ? "px-4 py-1.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 cursor-not-allowed border border-rose-500/20"
                          : "btn-primary-gradient px-4 py-1.5 rounded-full text-xs font-bold"
                      }
                    >
                      <span>{hasApplied ? 'Applied' : !item.eligible ? 'Ineligible' : 'Apply'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Application History */}
        {applications.length > 0 && (
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-base font-bold text-[#F8FAFC] flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-[#00D4FF]" />
              <span>Application Submissions ({applications.length})</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-white/[0.02] text-[#94A3B8] font-semibold uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-2.5 px-3">Internship Title</th>
                    <th className="py-2.5 px-3">Enterprise</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Stipend</th>
                    <th className="py-2.5 px-3">Compatibility</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-3 font-bold text-[#F8FAFC]">{app.title}</td>
                      <td className="py-3 px-3 text-slate-300">{app.company_name}</td>
                      <td className="py-3 px-3 text-[#94A3B8]">{app.is_remote ? 'Remote' : app.location}</td>
                      <td className="py-3 px-3 font-semibold text-emerald-400">₹{app.stipend_amount?.toLocaleString('en-IN')}/mo</td>
                      <td className="py-3 px-3 font-extrabold text-[#F8FAFC]">{Math.round(app.match_score)}%</td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30">
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

      </div>

      <ScoreBreakdownModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedMatch}
      />
    </div>
  );
}
