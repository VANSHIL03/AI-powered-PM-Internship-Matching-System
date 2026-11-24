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
      <div className="flex items-center justify-center p-20 text-slate-500 bg-[#000000] min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2997FF] mr-3"></div>
        <span>Loading student portal...</span>
      </div>
    );
  }

  const isAllocated = profile?.allocation_status === 'ALLOCATED' && profile?.allocated_internship;
  const allocated = profile?.allocated_internship;

  return (
    <div className="bg-[#000000] text-white min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Profile Overview Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#161617] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#30D158] bg-[#30D158]/15 px-3 py-0.5 rounded-full border border-[#30D158]/30">
                Verified Candidate
              </span>
              <span className="text-xs text-[#86868B]">
                ID: <strong className="text-white">{profile?.registration_number || 'PMIS-2026'}</strong>
              </span>
              <span className="text-xs text-[#86868B]">
                Category: <strong className="text-white">{profile?.category || 'GEN'}</strong>
              </span>
            </div>
            <h1 className="text-3xl font-black apple-text-gradient mt-1">
              Welcome, {profile?.full_name || user?.full_name || 'Candidate'}.
            </h1>
            <div className="text-xs text-[#86868B] flex flex-wrap items-center gap-3 pt-0.5">
              <span>{profile?.degree} ({profile?.field_of_study})</span>
              <span>•</span>
              <span>CGPA: <strong className="text-white">{profile?.cgpa_percentage}</strong></span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile?.city}, {profile?.state}</span>
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('student-profile')}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition border border-white/10 flex items-center space-x-1.5"
          >
            <span>Edit Profile & Skills</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {actionMessage && (
          <div className="p-4 rounded-2xl bg-[#2997FF]/15 border border-[#2997FF]/30 text-[#2997FF] text-xs font-semibold flex items-center justify-between">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage('')} className="text-white hover:opacity-80">✕</button>
          </div>
        )}

        {/* ALLOCATION STATUS BANNER (Apple Hardware / Allotment Style) */}
        {isAllocated ? (
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#0B2518] via-[#103D27] to-[#0A2215] border border-[#30D158]/40 relative overflow-hidden shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#30D158]/20 text-[#30D158] text-xs font-bold tracking-wide uppercase border border-[#30D158]/40">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Official Internship Allotment Confirmed</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white">
                  {allocated.title}
                </h2>
                <div className="text-sm font-semibold text-emerald-200 flex flex-wrap items-center gap-3">
                  <span className="flex items-center space-x-1">
                    <Building2 className="w-4 h-4 text-[#30D158]" />
                    <span>{allocated.company_name}</span>
                  </span>
                  <span>•</span>
                  <span>{allocated.sector}</span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4 text-[#30D158]" />
                    <span>{allocated.is_remote ? 'Remote' : allocated.location}</span>
                  </span>
                </div>
                <p className="text-xs text-[#86868B] leading-relaxed pt-1">
                  Congratulations! You have been awarded an internship under the PM Internship Scheme. Your compatibility score was calculated at <strong className="text-white">{profile.allocated_score}%</strong> by the Google OR-Tools optimization engine.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md min-w-[220px] text-center sm:text-right space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-[#86868B] font-bold block">
                  Monthly Stipend
                </span>
                <span className="text-3xl font-black text-[#30D158] block">
                  ₹{allocated.stipend_amount?.toLocaleString('en-IN')}/mo
                </span>
                <span className="text-xs text-[#86868B] font-medium block">
                  Duration: {allocated.duration_months} Months
                </span>
                <button
                  onClick={() => alert(`Official Allotment Confirmation:\n\nCandidate: ${profile.full_name}\nRole: ${allocated.title}\nEnterprise: ${allocated.company_name}\nLocation: ${allocated.location}\nStipend: ₹${allocated.stipend_amount}/mo\nCompatibility Score: ${profile.allocated_score}%\nRef: ${profile.registration_number}\n\nSigned by National Allocation Director.`)}
                  className="w-full mt-2 px-4 py-2 rounded-full bg-white text-black font-bold text-xs hover:bg-white/90 transition shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Allotment Letter</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-[#161617] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-[#FF9F0A] font-bold text-sm">
                <Clock className="w-4 h-4" />
                <span>Status: In National Allocation Pool</span>
              </div>
              <p className="text-xs text-[#86868B] max-w-2xl leading-relaxed">
                Your profile is active in the candidate pool. The optimization solver runs constraint-aware Integer Linear Programming to find the highest welfare match.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('ai-matching')}
              className="px-5 py-2.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold transition shrink-0"
            >
              Check Compatibility Matrix
            </button>
          </div>
        )}

        {/* AI Recommendations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold apple-text-gradient">
                Personalized AI Recommendations
              </h3>
              <p className="text-xs text-[#86868B]">
                Ranked by multi-criteria compatibility against your verified skills and preferences.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('internships')}
              className="text-xs font-semibold text-[#2997FF] hover:underline flex items-center space-x-1"
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
                  className="p-6 rounded-3xl bg-[#161617] border border-white/10 hover:border-white/25 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#2997FF] bg-[#2997FF]/15 px-2.5 py-0.5 rounded-full border border-[#2997FF]/30">
                        {item.sector}
                      </span>
                      
                      <button
                        onClick={() => handleOpenBreakdown(item)}
                        className={`px-3 py-1 rounded-full text-xs font-black border transition flex items-center space-x-1 ${
                          item.total_score >= 80 
                            ? 'bg-[#30D158]/15 text-[#30D158] border-[#30D158]/30 hover:bg-[#30D158]/25'
                            : item.total_score >= 65
                            ? 'bg-[#2997FF]/15 text-[#2997FF] border-[#2997FF]/30 hover:bg-[#2997FF]/25'
                            : 'bg-[#FF9F0A]/15 text-[#FF9F0A] border-[#FF9F0A]/30 hover:bg-[#FF9F0A]/25'
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{Math.round(item.total_score)}% Match</span>
                      </button>
                    </div>

                    <h4 className="text-base font-bold text-white line-clamp-1">
                      {item.internship_title}
                    </h4>
                    <div className="text-xs text-[#86868B] font-medium mb-3">
                      {item.company_name}
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-[#86868B] mb-4">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.is_remote ? 'Remote' : item.location}</span>
                      <span>•</span>
                      <span className="font-bold text-[#30D158]">₹{item.stipend_amount?.toLocaleString('en-IN')}/mo</span>
                    </div>

                    <div className="mb-4">
                      <div className="text-[10px] font-semibold text-[#86868B] uppercase mb-1">Skills Matched:</div>
                      <div className="flex flex-wrap gap-1">
                        {item.skills_matched.slice(0, 3).map((s, idx) => (
                          <span key={idx} className="text-[10px] font-medium bg-white/5 text-[#30D158] px-2 py-0.5 rounded-full border border-[#30D158]/20">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenBreakdown(item)}
                      className="text-xs text-[#86868B] hover:text-white font-semibold"
                    >
                      Explain Score
                    </button>

                    <button
                      onClick={() => handleApply(item.internship_id)}
                      disabled={hasApplied || applyingId === item.internship_id || !item.eligible}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                        hasApplied 
                          ? 'bg-white/10 text-slate-500 cursor-not-allowed'
                          : !item.eligible
                          ? 'bg-rose-500/10 text-rose-400 cursor-not-allowed border border-rose-500/20'
                          : 'bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-xs'
                      }`}
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
          <div className="p-6 rounded-3xl bg-[#161617] border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-[#2997FF]" />
              <span>Application Submissions ({applications.length})</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-black/40 text-[#86868B] font-semibold uppercase tracking-wider border-b border-white/10">
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
                    <tr key={app.id} className="hover:bg-white/5">
                      <td className="py-3 px-3 font-bold text-white">{app.title}</td>
                      <td className="py-3 px-3 text-slate-300">{app.company_name}</td>
                      <td className="py-3 px-3 text-[#86868B]">{app.is_remote ? 'Remote' : app.location}</td>
                      <td className="py-3 px-3 font-semibold text-[#30D158]">₹{app.stipend_amount?.toLocaleString('en-IN')}/mo</td>
                      <td className="py-3 px-3 font-extrabold text-white">{Math.round(app.match_score)}%</td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#2997FF]/20 text-[#2997FF] border border-[#2997FF]/30">
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
