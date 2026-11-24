import React from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Award, 
  MapPin, 
  BookOpen, 
  Briefcase, 
  Compass, 
  HelpCircle,
  Building
} from 'lucide-react';

export default function ScoreBreakdownModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  const {
    internship_title,
    company_name,
    sector,
    location,
    is_remote,
    stipend_amount,
    total_score = 0,
    eligible = true,
    ineligibility_reasons = [],
    breakdown = {},
    skills_matched = [],
    skills_missing = []
  } = data;

  const weights = {
    skills: 40,
    preferences: 20,
    location: 15,
    education: 10,
    experience: 10,
    other: 5
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#161617] text-white rounded-3xl shadow-2xl border border-white/15 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between bg-white/5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#2997FF] bg-[#2997FF]/15 px-3 py-0.5 rounded-full border border-[#2997FF]/30 flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Explainable AI Match Assessment</span>
              </span>
              {!eligible && (
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                  Ineligible
                </span>
              )}
            </div>
            <h3 className="text-2xl font-black text-white mt-1">
              {internship_title || 'Internship Opportunity'}
            </h3>
            <div className="text-xs text-[#86868B] flex items-center space-x-2 pt-0.5">
              <span className="font-semibold text-slate-300">{company_name}</span>
              <span>•</span>
              <span>{sector}</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{is_remote ? 'Remote' : location}</span>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#86868B] hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Top Score Summary Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl bg-black/60 border border-white/10 gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#2997FF]/20 via-[#BF5AF2]/20 to-[#FF375F]/20 border border-white/20 flex flex-col items-center justify-center font-black">
                <span className="text-2xl font-extrabold text-white leading-none">{Math.round(total_score)}</span>
                <span className="text-[9px] font-semibold uppercase text-[#86868B] mt-0.5">/ 100</span>
              </div>
              <div>
                <div className="text-base font-bold text-white">
                  {eligible ? (
                    total_score >= 80 ? 'Exceptional Match' :
                    total_score >= 65 ? 'Competitive Match' : 'Moderate Alignment'
                  ) : 'Not Eligible for Allocation'}
                </div>
                <div className="text-xs text-[#86868B] max-w-sm">
                  {eligible 
                    ? 'Evaluated across 6 multi-criteria dimensions configured by PM Internship allocation parameters.'
                    : 'Candidate does not satisfy mandatory prerequisite constraints.'}
                </div>
              </div>
            </div>

            {stipend_amount && (
              <div className="text-right sm:border-l sm:pl-4 border-white/10">
                <div className="text-[10px] text-[#86868B] uppercase font-semibold">Monthly Stipend</div>
                <div className="text-lg font-black text-[#30D158]">
                  ₹{stipend_amount.toLocaleString('en-IN')}/mo
                </div>
              </div>
            )}
          </div>

          {/* Ineligibility Warning */}
          {!eligible && ineligibility_reasons.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300">
              <div className="flex items-center space-x-2 font-bold text-xs text-rose-400">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Mandatory Eligibility Constraints Not Met:</span>
              </div>
              <ul className="mt-2 list-disc list-inside text-xs space-y-1 text-rose-300/90">
                {ineligibility_reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 6 Dimension Breakdown */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
              Scoring Model Dimensions
            </h4>

            {[
              { label: "1. Skill Compatibility", icon: Award, score: breakdown.skills || 0, max: weights.skills, color: "bg-[#FF9F0A]" },
              { label: "2. Student Preferences", icon: Compass, score: breakdown.preferences || 0, max: weights.preferences, color: "bg-[#2997FF]" },
              { label: "3. Location Compatibility", icon: MapPin, score: breakdown.location || 0, max: weights.location, color: "bg-[#30D158]" },
              { label: "4. Education & CGPA Merit", icon: BookOpen, score: breakdown.education || 0, max: weights.education, color: "bg-[#BF5AF2]" },
              { label: "5. Experience & Projects", icon: Briefcase, score: breakdown.experience || 0, max: weights.experience, color: "bg-[#FF375F]" },
              { label: "6. Diversity & Other Factors", icon: HelpCircle, score: breakdown.other || 0, max: weights.other, color: "bg-[#64D2FF]" },
            ].map((dim, idx) => {
              const Icon = dim.icon;
              const pct = Math.min(100, (dim.score / dim.max) * 100);
              return (
                <div key={idx} className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center space-x-2 text-slate-300 font-semibold">
                      <Icon className="w-4 h-4 text-[#86868B]" />
                      <span>{dim.label}</span>
                      <span className="text-[#86868B] font-normal text-[11px]">({dim.max}%)</span>
                    </span>
                    <span className="font-extrabold text-white">
                      {dim.score} / {dim.max} pts
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div className={`${dim.color} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Matched & Missing Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#30D158]/10 border border-[#30D158]/20">
              <div className="text-xs font-bold text-[#30D158] mb-2 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#30D158]" />
                <span>Matched Skills ({skills_matched.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills_matched.map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-[#30D158]/20 text-[#30D158] text-[11px] font-semibold border border-[#30D158]/30">
                    {s}
                  </span>
                ))}
                {skills_matched.length === 0 && <span className="text-xs text-[#86868B] italic">No skills matched</span>}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-xs font-bold text-[#FF9F0A] mb-2 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-[#FF9F0A]" />
                <span>Skills Gap ({skills_missing.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills_missing.map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-white/10 text-slate-300 text-[11px] font-medium border border-white/10">
                    {s}
                  </span>
                ))}
                {skills_missing.length === 0 && <span className="text-xs text-[#30D158] font-medium">All required skills met!</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 rounded-b-3xl flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90 transition"
          >
            Close Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
