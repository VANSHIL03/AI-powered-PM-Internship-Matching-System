import React, { useState, useEffect } from 'react';
import { studentsAPI, internshipsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ScoreBreakdownModal from '../components/ScoreBreakdownModal';
import { 
  Sparkles, 
  Search, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Filter, 
  Info,
  ChevronRight,
  Award,
  Zap
} from 'lucide-react';

export default function AIMatchingPage({ setActiveTab }) {
  const { user, isStudent } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [eligibilityFilter, setEligibilityFilter] = useState('all'); // all, eligible, ineligible
  const [minScore, setMinScore] = useState(0);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const res = await studentsAPI.getMatches();
      setMatches(res.data);
    } catch (err) {
      console.error("Error loading matches:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBreakdown = (item) => {
    setSelectedMatch(item);
    setIsModalOpen(true);
  };

  const filteredMatches = matches.filter((item) => {
    if (eligibilityFilter === 'eligible' && !item.eligible) return false;
    if (eligibilityFilter === 'ineligible' && item.eligible) return false;
    if (item.total_score < minScore) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = item.internship_title?.toLowerCase().includes(q);
      const matchCompany = item.company_name?.toLowerCase().includes(q);
      const matchSector = item.sector?.toLowerCase().includes(q);
      if (!matchTitle && !matchCompany && !matchSector) return false;
    }
    return true;
  });

  const getScoreBadge = (score, eligible) => {
    if (!eligible) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300 flex items-center space-x-1">
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          <span>Ineligible (0%)</span>
        </span>
      );
    }
    if (score >= 85) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>{Math.round(score)}% Match</span>
        </span>
      );
    }
    if (score >= 70) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-300">
          {Math.round(score)}% Match
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
        {Math.round(score)}% Match
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0F2A4A] to-[#107E54] text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-slate-700 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold tracking-wide border border-emerald-400/30">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Explainable Multi-Criteria Scoring Model (0–100)</span>
          </div>
          <h2 className="text-3xl font-black text-white">
            AI Compatibility Matching Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
            Calculates compatibility across Skill Match (40%), Preferences (20%), Location Distance (15%), Academic Eligibility (10%), Experience (10%), and Diversity Factors (5%). Mandatory eligibility rules serve as hard binary gating.
          </p>
        </div>
      </div>

      {/* Model Breakdown Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        {[
          { label: "Skills (40%)", desc: "Technical proficiency alignment", color: "border-amber-400 bg-amber-50 text-amber-900" },
          { label: "Preferences (20%)", desc: "Sector & work mode", color: "border-blue-400 bg-blue-50 text-blue-900" },
          { label: "Location (15%)", desc: "City & remote distance", color: "border-emerald-400 bg-emerald-50 text-emerald-900" },
          { label: "Education (10%)", desc: "Degree & CGPA merit", color: "border-purple-400 bg-purple-50 text-purple-900" },
          { label: "Experience (10%)", desc: "Projects & internships", color: "border-indigo-400 bg-indigo-50 text-indigo-900" },
          { label: "Other (5%)", desc: "Diversity factor", color: "border-teal-400 bg-teal-50 text-teal-900" },
        ].map((item, i) => (
          <div key={i} className={`p-2.5 rounded-xl border text-center ${item.color}`}>
            <div className="text-xs font-bold">{item.label}</div>
            <div className="text-[10px] text-slate-600 mt-0.5">{item.desc}</div>
          </div>
        ))}
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by role or company..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F2A4A] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center space-x-1">
            <span className="text-slate-500 font-semibold">Eligibility:</span>
            <select
              value={eligibilityFilter}
              onChange={(e) => setEligibilityFilter(e.target.value)}
              className="px-2 py-1.5 rounded-xl border border-slate-300 bg-white"
            >
              <option value="all">All Vacancies</option>
              <option value="eligible">Eligible Only</option>
              <option value="ineligible">Ineligible Only</option>
            </select>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-slate-500 font-semibold">Min Score:</span>
            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="px-2 py-1.5 rounded-xl border border-slate-300 bg-white"
            >
              <option value={0}>0%+</option>
              <option value={60}>60%+</option>
              <option value={75}>75%+</option>
              <option value={85}>85%+</option>
            </select>
          </div>
        </div>
      </div>

      {/* Matching Matrix Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-xs">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
          <span>Computing AI compatibility scores for all opportunities...</span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Evaluated Compatibility Ledger ({filteredMatches.length} Opportunities)
            </h3>
            <span className="text-xs text-slate-500">Sorted by match score descending</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Opportunity</th>
                  <th className="py-3 px-4">Enterprise</th>
                  <th className="py-3 px-4">Sector</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Stipend</th>
                  <th className="py-3 px-4">Compatibility Score</th>
                  <th className="py-3 px-4 text-right">Explainability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMatches.map((item, index) => (
                  <tr 
                    key={item.internship_id}
                    className="hover:bg-slate-50/70 transition cursor-pointer"
                    onClick={() => handleOpenBreakdown(item)}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-400">
                      #{index + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.internship_title}</div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-1.5 mt-0.5">
                        <span>Skills matched: {item.skills_matched.length}</span>
                        {item.skills_missing.length > 0 && (
                          <span className="text-amber-700">({item.skills_missing.length} missing)</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{item.company_name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{item.sector}</td>
                    <td className="py-3.5 px-4 text-slate-600">{item.is_remote ? 'Remote' : item.location}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">₹{item.stipend_amount?.toLocaleString('en-IN')}/mo</td>
                    <td className="py-3.5 px-4">
                      {getScoreBadge(item.total_score, item.eligible)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenBreakdown(item); }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition inline-flex items-center space-x-1"
                      >
                        <span>Breakdown</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Score Breakdown Modal */}
      <ScoreBreakdownModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedMatch}
      />
    </div>
  );
}
