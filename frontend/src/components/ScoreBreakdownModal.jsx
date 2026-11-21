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

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (score >= 70) return 'text-blue-700 bg-blue-50 border-blue-300';
    if (score >= 50) return 'text-amber-700 bg-amber-50 border-amber-300';
    return 'text-rose-700 bg-rose-50 border-rose-300';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-slate-50 to-white">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Explainable AI Match Assessment</span>
              </span>
              {!eligible && (
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-300">
                  Hard Ineligibility Triggered
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-2">
              {internship_title || 'Internship Opportunity'}
            </h3>
            <div className="text-sm text-slate-600 flex items-center space-x-3 mt-1">
              <span className="font-semibold text-slate-800">{company_name}</span>
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Top Score Summary Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 gap-4">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center font-black ${getScoreColor(total_score)}`}>
                <span className="text-2xl leading-none">{Math.round(total_score)}</span>
                <span className="text-[10px] font-semibold uppercase">out of 100</span>
              </div>
              <div>
                <div className="text-base font-bold text-slate-900">
                  {eligible ? (
                    total_score >= 80 ? 'Exceptional Match' :
                    total_score >= 65 ? 'Competitive Match' : 'Moderate Alignment'
                  ) : 'Not Eligible for Allocation'}
                </div>
                <div className="text-xs text-slate-600 max-w-sm">
                  {eligible 
                    ? 'Evaluated across 6 multi-criteria dimensions configured by PM Internship allocation parameters.'
                    : 'Candidate does not satisfy mandatory prerequisite constraints.'}
                </div>
              </div>
            </div>

            {stipend_amount && (
              <div className="text-right sm:border-l sm:pl-4 border-slate-200">
                <div className="text-[11px] text-slate-500 uppercase font-semibold">Monthly Stipend</div>
                <div className="text-base font-extrabold text-emerald-800">
                  ₹{stipend_amount.toLocaleString('en-IN')}/mo
                </div>
              </div>
            )}
          </div>

          {/* Ineligibility Warning if hard constraint failed */}
          {!eligible && ineligibility_reasons.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
              <div className="flex items-center space-x-2 font-bold text-sm text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Mandatory Eligibility Constraints Not Met:</span>
              </div>
              <ul className="mt-2 list-disc list-inside text-xs space-y-1 text-rose-700">
                {ineligibility_reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
              <div className="mt-2 text-[11px] text-rose-600 italic">
                *Note: Hard eligibility rules operate as binary constraint filters prior to scoring.
              </div>
            </div>
          )}

          {/* Breakdown by 6 criteria */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Configurable Scoring Model Breakdown
            </h4>

            <div className="space-y-3">
              {/* 1. Skill Compatibility (40%) */}
              <div className="p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50/50 transition">
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1">
                  <span className="flex items-center space-x-1.5 font-bold text-slate-900">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Skill Compatibility</span>
                    <span className="text-slate-600 font-normal">(Target Weight: {weights.skills}%)</span>
                  </span>
                  <span className="font-extrabold text-slate-900">
                    {breakdown.skills || 0} / {weights.skills} pts
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, ((breakdown.skills || 0) / weights.skills) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* 2. Preferences (20%) */}
              <div className="p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50/50 transition">
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1">
                  <span className="flex items-center space-x-1.5 font-bold text-slate-900">
                    <Compass className="w-4 h-4 text-blue-500" />
                    <span>Student Sector & Mode Preferences</span>
                    <span className="text-slate-600 font-normal">(Target Weight: {weights.preferences}%)</span>
                  </span>
                  <span className="font-extrabold text-slate-900">
                    {breakdown.preferences || 0} / {weights.preferences} pts
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, ((breakdown.preferences || 0) / weights.preferences) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* 3. Location Compatibility (15%) */}
              <div className="p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50/50 transition">
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1">
                  <span className="flex items-center space-x-1.5 font-bold text-slate-900">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span>Location Compatibility</span>
                    <span className="text-slate-600 font-normal">(Target Weight: {weights.location}%)</span>
                  </span>
                  <span className="font-extrabold text-slate-900">
                    {breakdown.location || 0} / {weights.location} pts
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, ((breakdown.location || 0) / weights.location) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* 4. Education & Academic Eligibility (10%) */}
              <div className="p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50/50 transition">
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1">
                  <span className="flex items-center space-x-1.5 font-bold text-slate-900">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                    <span>Education, Degree & CGPA Merit</span>
                    <span className="text-slate-600 font-normal">(Target Weight: {weights.education}%)</span>
                  </span>
                  <span className="font-extrabold text-slate-900">
                    {breakdown.education || 0} / {weights.education} pts
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, ((breakdown.education || 0) / weights.education) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* 5. Experience & Projects (10%) */}
              <div className="p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50/50 transition">
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1">
                  <span className="flex items-center space-x-1.5 font-bold text-slate-900">
                    <Briefcase className="w-4 h-4 text-indigo-500" />
                    <span>Experience & Relevant Projects</span>
                    <span className="text-slate-600 font-normal">(Target Weight: {weights.experience}%)</span>
                  </span>
                  <span className="font-extrabold text-slate-900">
                    {breakdown.experience || 0} / {weights.experience} pts
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, ((breakdown.experience || 0) / weights.experience) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* 6. Other / Diversity Criteria (5%) */}
              <div className="p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50/50 transition">
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1">
                  <span className="flex items-center space-x-1.5 font-bold text-slate-900">
                    <HelpCircle className="w-4 h-4 text-teal-500" />
                    <span>Diversity & Demographic Criteria</span>
                    <span className="text-slate-600 font-normal">(Target Weight: {weights.other}%)</span>
                  </span>
                  <span className="font-extrabold text-slate-900">
                    {breakdown.other || 0} / {weights.other} pts
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, ((breakdown.other || 0) / weights.other) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Breakdown Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <div className="text-xs font-bold text-emerald-900 mb-2 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Matched Skills ({skills_matched.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills_matched.length > 0 ? (
                  skills_matched.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-semibold border border-emerald-300">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No skills matched</span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-700 mb-2 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Skills Gap / Unmatched ({skills_missing.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills_missing.length > 0 ? (
                  skills_missing.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[11px] font-medium border border-slate-300">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-emerald-600 font-medium">All required skills fulfilled!</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            Close Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
