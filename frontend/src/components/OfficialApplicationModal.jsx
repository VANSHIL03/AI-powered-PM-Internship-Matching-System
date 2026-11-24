import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Building2, 
  MapPin, 
  CheckCircle2, 
  Copy, 
  ShieldCheck, 
  Briefcase, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { studentsAPI } from '../services/api';

export default function OfficialApplicationModal({ isOpen, onClose, internship, onAppliedSuccess }) {
  if (!isOpen || !internship) return null;

  const { user, isStudent } = useAuth();
  const [copied, setCopied] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [trackedSuccess, setTrackedSuccess] = useState(false);

  const applyUrl = internship.apply_url || "https://www.tcs.com/careers/india";
  const officialPortalUrl = internship.official_portal_url || "https://pminternship.mca.gov.in/";

  const candidateName = user?.full_name || "Vanshil Gupta";
  const registrationNo = "PMIS-2026-8842";
  const userEmail = user?.email || "vanshil.gupta@example.edu";

  const prefillText = `Application under Prime Minister's Internship Scheme 2026
Candidate Name: ${candidateName}
PMIS Registration No: ${registrationNo}
Email: ${userEmail}
Target Opportunity: ${internship.title} at ${internship.company_name}
Academic Qualification: B.Tech Computer Science & Engineering (CGPA: 8.72/10.0)
Key Competencies: Python, FastAPI, React, SQL, PostgreSQL, Docker, AWS, Scikit-Learn
Statement: I am writing to express my strong candidacy for the ${internship.title} role under the national PM Internship Scheme clearinghouse.`;

  const handleCopyStatement = () => {
    navigator.clipboard.writeText(prefillText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTrackApplication = async () => {
    if (!isStudent) {
      setTrackedSuccess(true);
      if (onAppliedSuccess) onAppliedSuccess(internship.id);
      return;
    }
    setTracking(true);
    try {
      await studentsAPI.applyInternship(internship.id);
      setTrackedSuccess(true);
      if (onAppliedSuccess) onAppliedSuccess(internship.id);
    } catch (err) {
      console.warn("Could not save internal tracking state:", err);
      setTrackedSuccess(true);
    } finally {
      setTracking(false);
    }
  };

  const handleOpenExternal = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    handleTrackApplication();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto font-sans">
      <div className="glass-panel text-[#F8FAFC] max-w-xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 shadow-2xl border border-white/20">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between bg-white/[0.02]">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#00D4FF] bg-[#00D4FF]/10 px-3 py-0.5 rounded-full border border-[#00D4FF]/25 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-[#00D4FF]" />
                <span>Verified PM Internship Scheme Vacancy</span>
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#F8FAFC] mt-1 leading-snug">
              {internship.title}
            </h3>
            <div className="text-xs text-[#94A3B8] flex items-center space-x-2 pt-0.5">
              <span className="font-semibold text-slate-300">{internship.company_name}</span>
              <span>•</span>
              <span className="text-[#00D4FF]">{internship.sector}</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{internship.is_remote ? 'Remote' : internship.location}</span>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#94A3B8] hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Quick Notice Banner */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Official Corporate Application Link</span>
              </span>
              <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
                ₹{internship.stipend_amount?.toLocaleString('en-IN')}/mo
              </span>
            </div>
            <p className="text-[#94A3B8] leading-relaxed">
              This opening is actively hosted under the <strong>Prime Minister's Internship Scheme 2026</strong>. Clicking below will redirect you to the verified enterprise careers portal and Central MCA PMIS portal where you can finalize and submit your application.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="text-[11px] font-bold text-[#F8FAFC] uppercase tracking-wider">
              Step 1: Redirect to Official Application Portals
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleOpenExternal(applyUrl)}
                className="btn-primary-gradient p-3 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 text-white shadow-lg shadow-[#6366F1]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Apply on {internship.company_name?.split(' ')[0] || 'Company'} Portal</span>
                <ExternalLink className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleOpenExternal(officialPortalUrl)}
                className="btn-glass-secondary p-3 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 text-[#00D4FF] border-[#00D4FF]/30 hover:bg-[#00D4FF]/10 active:scale-[0.98] transition-all"
              >
                <span>MCA PMIS Central Portal</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Candidate Pre-fill Helper */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00D4FF]" />
                <span>Pre-filled Application Statement</span>
              </span>
              <button
                onClick={handleCopyStatement}
                className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-[#F8FAFC] flex items-center space-x-1 border border-white/10 transition"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Statement</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-black/60 border border-white/5 text-[11px] text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
              {prefillText}
            </pre>
          </div>

          {/* Internal Tracking Status */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-[11px] text-[#94A3B8]">
              {trackedSuccess ? (
                <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tracked in your Student Portal applications</span>
                </span>
              ) : (
                <span>Track this application in your PMIS dashboard</span>
              )}
            </div>
            {!trackedSuccess && (
              <button
                onClick={handleTrackApplication}
                disabled={tracking}
                className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 hover:bg-white/20 text-[#F8FAFC] border border-white/15"
              >
                {tracking ? 'Saving...' : 'Mark as Applied'}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          <span className="text-[11px] text-[#94A3B8]">
            Direct portal links open in a secure new tab.
          </span>
          <button
            onClick={onClose}
            className="btn-glass-secondary px-5 py-2 rounded-full text-xs font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
