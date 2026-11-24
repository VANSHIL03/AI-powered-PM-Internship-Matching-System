import React, { useState, useEffect } from 'react';
import { studentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ScoreBreakdownModal from '../components/ScoreBreakdownModal';
import OfficialApplicationModal from '../components/OfficialApplicationModal';
import PortfolioAnalyzerWidget from '../components/PortfolioAnalyzerWidget';
import { 
  Sparkles, 
  Search, 
  MapPin, 
  Building2, 
  AlertTriangle, 
  ChevronRight,
  Zap,
  CheckCircle2, 
  Filter,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export default function AIMatchingPage({ setActiveTab }) {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Application Modal state
  const [selectedInternshipForApply, setSelectedInternshipForApply] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

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

  const handleOpenApplyModal = (item) => {
    setSelectedInternshipForApply(item);
    setIsApplyModalOpen(true);
  };

  const handleAnalysisCompleted = (data) => {
    if (data.matches && data.matches.length > 0) {
      setMatches(data.matches);
    }
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
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Hero Banner Card with Frosted Glass & Ambient Accents */}
        <div className="glass-panel p-8 sm:p-12 relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#00D4FF] bg-[#00D4FF]/10 px-3 py-0.5 rounded-full border border-[#00D4FF]/25 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-[#00D4FF]" />
                <span>Explainable 6-Dimension Clearinghouse</span>
              </span>
              <span className="text-xs text-[#94A3B8]">
                Formula Weighting: <strong className="text-[#F8FAFC]">Skills 40% &bull; Pref 20% &bull; Loc 15% &bull; Edu 10% &bull; Exp 10% &bull; Other 5%</strong>
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
              AI Matching Engine.
            </h1>
            <p className="text-xs text-[#94A3B8] max-w-2xl leading-relaxed">
              Transparent multi-criteria matching evaluates student profiles against open corporate vacancies under the Prime Minister's Internship Scheme with mathematical fairness and hard eligibility constraints.
            </p>
          </div>
        </div>

        {/* AI Portfolio Analyzer Component */}
        <PortfolioAnalyzerWidget onAnalysisComplete={handleAnalysisCompleted} />

        {/* Filter Controls Card */}
        <div className="glass-panel p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Search */}
            <div className="sm:col-span-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search roles or enterprises..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#00D4FF]"
              />
            </div>

            {/* Eligibility Filter */}
            <div>
              <select
                value={eligibilityFilter}
                onChange={(e) => setEligibilityFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#00D4FF]"
              >
                <option value="all">All Vacancies</option>
                <option value="eligible">Eligible Only (Hard Prerequisites Met)</option>
                <option value="ineligible">Ineligible Roles</option>
              </select>
            </div>

            {/* Min Score Filter */}
            <div>
              <select
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#00D4FF]"
              >
                <option value={0}>Any Match Score</option>
                <option value={50}>50%+</option>
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
              <span className="text-xs text-[#94A3B8] hidden sm:inline">Click any row for explainability &bull; Direct portal links redirect in new tab</span>
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
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredMatches.map((item, index) => {
                    const applyUrl = item.apply_url || "https://pminternship.mca.gov.in/";

                    return (
                      <tr 
                        key={item.internship_id}
                        className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                        onClick={() => handleOpenBreakdown(item)}
                      >
                        <td className="py-4 px-4 font-mono font-bold text-[#94A3B8]">
                          #{index + 1}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-[#F8FAFC] text-sm group-hover:text-[#00D4FF] transition-colors">
                            {item.internship_title}
                          </div>
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
                          <div className="flex items-center justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenBreakdown(item)}
                              className="btn-glass-secondary px-3 py-1.5 rounded-full text-[11px] inline-flex items-center space-x-1"
                            >
                              <span>Explain</span>
                              <ChevronRight className="w-3.5 h-3.5 text-[#00D4FF]" />
                            </button>

                            <button
                              onClick={() => handleOpenApplyModal(item)}
                              className="btn-primary-gradient px-3.5 py-1.5 rounded-full text-[11px] font-bold inline-flex items-center space-x-1 text-white shadow-sm shadow-[#6366F1]/20"
                            >
                              <span>Apply</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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

      {/* Official Application Modal */}
      <OfficialApplicationModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        internship={selectedInternshipForApply}
        onAppliedSuccess={(id) => {
          console.log("Tracked applied:", id);
        }}
      />
    </div>
  );
}
