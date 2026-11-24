import React, { useState, useEffect } from 'react';
import { studentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ScoreBreakdownModal from '../components/ScoreBreakdownModal';
import { 
  Sparkles, 
  Search, 
  MapPin, 
  Building2, 
  AlertTriangle, 
  ChevronRight,
  Zap,
  CheckCircle2,
  Filter
} from 'lucide-react';

export default function AIMatchingPage({ setActiveTab }) {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [eligibilityFilter, setEligibilityFilter] = useState('all');
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
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center space-x-1">
          <AlertTriangle className="w-3 h-3 text-rose-400" />
          <span>Ineligible (0%)</span>
        </span>
      );
    }
    if (score >= 85) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1 shadow-sm shadow-emerald-500/20">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>{Math.round(score)}% Match</span>
        </span>
      );
    }
    if (score >= 70) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/30">
          {Math.round(score)}% Match
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
        {Math.round(score)}% Match
      </span>
    );
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 space-y-10 font-sans selection:bg-[#7C3AED] selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Hero Banner Card with Frosted Glass & Ambient Accents */}
        <div className="glass-panel p-8 sm:p-12 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-3.5">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/[0.04] text-[#F8FAFC] text-xs font-bold tracking-wide border border-white/15 backdrop-blur-md">
              <Zap className="w-3.5 h-3.5 text-[#00D4FF]" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#C084FC]">
                Multi-Criteria Neural Compatibility Model
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-[#F8FAFC] tracking-tight">
              AI Matching Engine.
            </h1>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Calculates real-time candidate compatibility scores (0–100%) based on Skills (40%), Preferences (20%), Location (15%), Education & CGPA (10%), Experience (10%), and Welfare Factors (5%). Mandatory prerequisites operate as binary hard gates.
            </p>
          </div>
        </div>

        {/* 6 Dimensions Bento Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3.5">
          {[
            { label: "Skills (40%)", desc: "Technical overlap", color: "text-[#818CF8]", border: "hover:border-[#6366F1]/50" },
            { label: "Preferences (20%)", desc: "Sector & work mode", color: "text-[#00D4FF]", border: "hover:border-[#00D4FF]/50" },
            { label: "Location (15%)", desc: "Regional proximity", color: "text-emerald-400", border: "hover:border-emerald-500/50" },
            { label: "Education (10%)", desc: "Degree & CGPA merit", color: "text-[#C084FC]", border: "hover:border-[#C084FC]/50" },
            { label: "Experience (10%)", desc: "Projects & interns", color: "text-rose-400", border: "hover:border-rose-500/50" },
            { label: "Welfare (5%)", desc: "Affirmative factors", color: "text-amber-400", border: "hover:border-amber-500/50" },
          ].map((item, i) => (
            <div key={i} className={`glass-panel p-4 text-center space-y-1.5 transition-all ${item.border}`}>
              <div className={`text-xs font-bold ${item.color}`}>{item.label}</div>
              <div className="text-[10px] text-[#94A3B8]">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by role title or enterprise..."
              className="w-full pl-10 pr-3 py-2.5 rounded-full bg-black/40 border border-white/10 text-xs text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#00D4FF]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center space-x-1.5">
              <span className="text-[#94A3B8] font-medium">Eligibility:</span>
              <select
                value={eligibilityFilter}
                onChange={(e) => setEligibilityFilter(e.target.value)}
                className="px-3.5 py-1.5 rounded-full bg-black/40 border border-white/10 text-[#F8FAFC] text-xs focus:outline-none focus:border-[#00D4FF]"
              >
                <option value="all">All Opportunities</option>
                <option value="eligible">Eligible Only</option>
                <option value="ineligible">Ineligible Only</option>
              </select>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-[#94A3B8] font-medium">Min Score:</span>
              <select
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="px-3.5 py-1.5 rounded-full bg-black/40 border border-white/10 text-[#F8FAFC] text-xs focus:outline-none focus:border-[#00D4FF]"
              >
                <option value={0}>0%+</option>
                <option value={60}>60%+</option>
                <option value={75}>75%+</option>
                <option value={85}>85%+</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ledger Table in Frosted Glass Container */}
        {loading ? (
          <div className="py-24 text-center text-[#94A3B8] text-xs space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#00D4FF] animate-spin mx-auto"></div>
            <span>Evaluating multi-criteria compatibility matrix across opportunities...</span>
          </div>
        ) : (
          <div className="glass-panel overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F8FAFC]">
                Ranked Compatibility Ledger ({filteredMatches.length} Opportunities)
              </h3>
              <span className="text-xs text-[#94A3B8] hidden sm:inline">Click any row to open the Explainable Score breakdown</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-white/[0.02] text-[#94A3B8] font-semibold uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4">Rank</th>
                    <th className="py-3.5 px-4">Opportunity</th>
                    <th className="py-3.5 px-4">Enterprise</th>
                    <th className="py-3.5 px-4">Sector</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Stipend</th>
                    <th className="py-3.5 px-4">Compatibility</th>
                    <th className="py-3.5 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredMatches.map((item, index) => (
                    <tr 
                      key={item.internship_id}
                      className="hover:bg-white/[0.04] transition-colors cursor-pointer"
                      onClick={() => handleOpenBreakdown(item)}
                    >
                      <td className="py-4 px-4 font-mono font-bold text-[#94A3B8]">
                        #{index + 1}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-[#F8FAFC] text-sm">{item.internship_title}</div>
                        <div className="text-[11px] text-[#94A3B8] flex items-center space-x-1.5 mt-0.5">
                          <span>{item.skills_matched.length} Skills matched</span>
                          {item.skills_missing.length > 0 && (
                            <span className="text-amber-400">({item.skills_missing.length} missing)</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-300">{item.company_name}</td>
                      <td className="py-4 px-4 text-[#94A3B8]">{item.sector}</td>
                      <td className="py-4 px-4 text-[#94A3B8]">{item.is_remote ? 'Remote' : item.location}</td>
                      <td className="py-4 px-4 font-bold text-emerald-400">₹{item.stipend_amount?.toLocaleString('en-IN')}/mo</td>
                      <td className="py-4 px-4">
                        {getScoreBadge(item.total_score, item.eligible)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenBreakdown(item); }}
                          className="btn-glass-secondary px-3.5 py-1.5 rounded-full text-[11px] inline-flex items-center space-x-1"
                        >
                          <span>Explain</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#00D4FF]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Breakdown Modal */}
      <ScoreBreakdownModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedMatch}
      />
    </div>
  );
}
