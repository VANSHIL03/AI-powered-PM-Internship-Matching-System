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
  CheckCircle2
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
        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30 flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-[#30D158]" />
          <span>{Math.round(score)}% Match</span>
        </span>
      );
    }
    if (score >= 70) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#2997FF]/15 text-[#2997FF] border border-[#2997FF]/30">
          {Math.round(score)}% Match
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#FF9F0A]/15 text-[#FF9F0A] border border-[#FF9F0A]/30">
        {Math.round(score)}% Match
      </span>
    );
  };

  return (
    <div className="bg-[#000000] text-white min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Apple Intelligence Hero Banner */}
        <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#161617] via-[#161617] to-[#1C1C24] border border-white/10 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-tr from-[#2997FF]/20 via-[#BF5AF2]/25 to-[#FF375F]/20 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/10 text-white text-xs font-bold tracking-wide border border-white/15">
              <Zap className="w-3.5 h-3.5 text-[#2997FF]" />
              <span>Multi-Criteria Neural Compatibility Model</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black apple-text-gradient">
              AI Matching Engine.
            </h1>
            <p className="text-sm text-[#86868B] leading-relaxed">
              Calculates real-time candidate compatibility scores (0–100) based on Skills (40%), Preferences (20%), Location (15%), Education & CGPA (10%), Experience (10%), and Diversity Factors (5%). Mandatory prerequisites operate as binary hard gates.
            </p>
          </div>
        </div>

        {/* 6 Dimensions Bento Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {[
            { label: "Skills (40%)", desc: "Technical proficiency overlap", border: "border-[#FF9F0A]/30 text-[#FF9F0A]" },
            { label: "Preferences (20%)", desc: "Sector & remote mode", border: "border-[#2997FF]/30 text-[#2997FF]" },
            { label: "Location (15%)", desc: "City & regional proximity", border: "border-[#30D158]/30 text-[#30D158]" },
            { label: "Education (10%)", desc: "Degree & CGPA merit", border: "border-[#BF5AF2]/30 text-[#BF5AF2]" },
            { label: "Experience (10%)", desc: "Projects & internships", border: "border-[#FF375F]/30 text-[#FF375F]" },
            { label: "Other (5%)", desc: "Demographic factors", border: "border-[#64D2FF]/30 text-[#64D2FF]" },
          ].map((item, i) => (
            <div key={i} className={`p-4 rounded-2xl bg-[#161617] border ${item.border} text-center space-y-1`}>
              <div className="text-xs font-bold">{item.label}</div>
              <div className="text-[10px] text-[#86868B]">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="p-4 rounded-3xl bg-[#161617] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by role title or enterprise..."
              className="w-full pl-10 pr-3 py-2.5 rounded-full bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#2997FF]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center space-x-1.5">
              <span className="text-[#86868B] font-medium">Eligibility:</span>
              <select
                value={eligibilityFilter}
                onChange={(e) => setEligibilityFilter(e.target.value)}
                className="px-3 py-1.5 rounded-full bg-black/60 border border-white/10 text-white text-xs"
              >
                <option value="all">All Opportunities</option>
                <option value="eligible">Eligible Only</option>
                <option value="ineligible">Ineligible Only</option>
              </select>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-[#86868B] font-medium">Min Score:</span>
              <select
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="px-3 py-1.5 rounded-full bg-black/60 border border-white/10 text-white text-xs"
              >
                <option value={0}>0%+</option>
                <option value={60}>60%+</option>
                <option value={75}>75%+</option>
                <option value={85}>85%+</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-xs">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2997FF] mx-auto mb-3"></div>
            <span>Evaluating multi-criteria compatibility matrix...</span>
          </div>
        ) : (
          <div className="bg-[#161617] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                Ranked Compatibility Ledger ({filteredMatches.length} Opportunities)
              </h3>
              <span className="text-xs text-[#86868B]">Click any row to open the Explainable Score breakdown</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-black/40 text-[#86868B] font-semibold uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Opportunity</th>
                    <th className="py-3 px-4">Enterprise</th>
                    <th className="py-3 px-4">Sector</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Stipend</th>
                    <th className="py-3 px-4">Compatibility</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredMatches.map((item, index) => (
                    <tr 
                      key={item.internship_id}
                      className="hover:bg-white/5 transition cursor-pointer"
                      onClick={() => handleOpenBreakdown(item)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#86868B]">
                        #{index + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{item.internship_title}</div>
                        <div className="text-[11px] text-[#86868B] flex items-center space-x-1.5 mt-0.5">
                          <span>{item.skills_matched.length} Skills matched</span>
                          {item.skills_missing.length > 0 && (
                            <span className="text-[#FF9F0A]">({item.skills_missing.length} missing)</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-300">{item.company_name}</td>
                      <td className="py-3.5 px-4 text-[#86868B]">{item.sector}</td>
                      <td className="py-3.5 px-4 text-[#86868B]">{item.is_remote ? 'Remote' : item.location}</td>
                      <td className="py-3.5 px-4 font-bold text-[#30D158]">₹{item.stipend_amount?.toLocaleString('en-IN')}/mo</td>
                      <td className="py-3.5 px-4">
                        {getScoreBadge(item.total_score, item.eligible)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenBreakdown(item); }}
                          className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition inline-flex items-center space-x-1"
                        >
                          <span>Explain</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
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
