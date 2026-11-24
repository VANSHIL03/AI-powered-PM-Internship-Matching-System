import React, { useState, useEffect } from 'react';
import { internshipsAPI, studentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  MapPin, 
  Building2, 
  Briefcase, 
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Filter
} from 'lucide-react';

export default function InternshipsListingPage({ setActiveTab }) {
  const { user, isAuthenticated, isStudent } = useAuth();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [minStipend, setMinStipend] = useState(0);

  const [sectors, setSectors] = useState([]);
  const [locations, setLocations] = useState([]);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [applyingId, setApplyingId] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    loadFiltersAndInternships();
  }, []);

  const loadFiltersAndInternships = async () => {
    setLoading(true);
    try {
      const [secRes, locRes, listRes] = await Promise.all([
        internshipsAPI.getSectors().catch(() => ({ data: [] })),
        internshipsAPI.getLocations().catch(() => ({ data: [] })),
        internshipsAPI.getAll().catch(() => ({ data: [] }))
      ]);

      setSectors(['All', ...secRes.data]);
      setLocations(['All', ...locRes.data]);
      setInternships(listRes.data);

      if (isStudent) {
        const appsRes = await studentsAPI.getApplications().catch(() => ({ data: [] }));
        setAppliedIds(new Set(appsRes.data.map(a => a.internship_id)));
      }
    } catch (err) {
      console.error("Error loading internships:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (internshipId) => {
    if (!isAuthenticated) {
      setActiveTab('auth');
      return;
    }
    if (!isStudent) {
      alert("Please sign in with a Student account to apply for internships.");
      return;
    }

    setApplyingId(internshipId);
    try {
      const res = await studentsAPI.applyInternship(internshipId);
      setToast(res.data.message || 'Application submitted successfully!');
      setAppliedIds(new Set([...appliedIds, internshipId]));
    } catch (err) {
      alert(err.response?.data?.detail || 'Application failed.');
    } finally {
      setApplyingId(null);
    }
  };

  const filtered = internships.filter((item) => {
    if (selectedSector !== 'All' && item.sector !== selectedSector) return false;
    if (selectedLocation !== 'All' && item.location !== selectedLocation) return false;
    if (remoteOnly && !item.is_remote) return false;
    if (minStipend > 0 && item.stipend_amount < minStipend) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchComp = item.company_name?.toLowerCase().includes(q);
      const matchSector = item.sector?.toLowerCase().includes(q);
      const matchSkills = item.required_skills?.some(s => s.toLowerCase().includes(q));
      if (!matchTitle && !matchComp && !matchSector && !matchSkills) return false;
    }
    return true;
  });

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 space-y-10 font-sans selection:bg-[#7C3AED] selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Strip with Glowing CTA */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-2 border-b border-white/10">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00D4FF] bg-[#00D4FF]/10 px-3 py-1 rounded-full border border-[#00D4FF]/20">
              National Opportunity Catalog
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-[#F8FAFC] tracking-tight">
              Explore 30+ Vacancies.
            </h1>
            <p className="text-xs text-[#94A3B8]">
              Filter by industry sector, geographic preference, or required technical competencies.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('ai-matching')}
            className="btn-primary-gradient px-6 py-3 rounded-full text-xs font-semibold space-x-2"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Check My AI Match Ranking</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {toast && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{toast}</span>
            </div>
            <button onClick={() => setToast('')} className="text-white/60 hover:text-white">✕</button>
          </div>
        )}

        {/* Filter Controls (Frosted Glass Container) */}
        <div className="glass-panel p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by role title, enterprise name, or required skill..."
                className="w-full pl-10 pr-3 py-2.5 rounded-full bg-black/40 border border-white/10 text-xs text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#00D4FF]"
              />
            </div>

            <div>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-full bg-black/40 border border-white/10 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#00D4FF]"
              >
                <option value="All">All Sectors ({sectors.length - 1})</option>
                {sectors.filter(s => s !== 'All').map((sec, i) => (
                  <option key={i} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-full bg-black/40 border border-white/10 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#00D4FF]"
              >
                <option value="All">All Locations ({locations.length - 1})</option>
                {locations.filter(l => l !== 'All').map((loc, i) => (
                  <option key={i} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs pt-3 border-t border-white/10 gap-3 text-[#94A3B8]">
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2 cursor-pointer text-[#F8FAFC] font-medium">
                <input
                  type="checkbox"
                  checked={remoteOnly}
                  onChange={(e) => setRemoteOnly(e.target.checked)}
                  className="rounded text-[#6366F1] focus:ring-0 bg-black/40 border-white/20"
                />
                <span>Remote Only</span>
              </label>

              <div className="flex items-center space-x-2">
                <span>Min Stipend:</span>
                <select
                  value={minStipend}
                  onChange={(e) => setMinStipend(Number(e.target.value))}
                  className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[#F8FAFC] text-xs focus:outline-none"
                >
                  <option value={0}>Any</option>
                  <option value={18000}>₹18,000+</option>
                  <option value={20000}>₹20,000+</option>
                  <option value={25000}>₹25,000+</option>
                </select>
              </div>
            </div>

            <div>
              Showing <strong className="text-[#F8FAFC]">{filtered.length}</strong> of {internships.length} opportunities
            </div>
          </div>
        </div>

        {/* Bento Grid of Opportunities */}
        {loading ? (
          <div className="py-24 text-center text-[#94A3B8] text-xs space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#00D4FF] animate-spin mx-auto"></div>
            <span>Loading corporate vacancies...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-[#94A3B8] text-xs glass-panel space-y-2">
            <Briefcase className="w-8 h-8 text-[#94A3B8]/60 mx-auto" />
            <span>No opportunities match your filter criteria. Try resetting filters.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => {
              const hasApplied = appliedIds.has(item.id);
              return (
                <div 
                  key={item.id}
                  className="bento-card-interactive p-6 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#00D4FF] bg-[#00D4FF]/10 px-2.5 py-0.5 rounded-full border border-[#00D4FF]/25">
                        {item.sector}
                      </span>
                      <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
                        ₹{item.stipend_amount?.toLocaleString('en-IN')}/mo
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#F8FAFC] group-hover:text-[#00D4FF] transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <div className="text-xs text-[#94A3B8] font-medium mb-3">
                      {item.company_name}
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-[#94A3B8] mb-4">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.is_remote ? 'Remote' : item.location}</span>
                      <span>•</span>
                      <span>{item.duration_months} Months</span>
                      <span>•</span>
                      <span>Min CGPA: <strong className="text-[#F8FAFC]">{item.min_cgpa}</strong></span>
                    </div>

                    {/* Skills Chips */}
                    <div className="space-y-1.5 mb-4">
                      <div className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider">Required Skills</div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.required_skills?.map((s, idx) => (
                          <span key={idx} className="text-[10px] font-medium bg-white/[0.04] text-[#F8FAFC] px-2.5 py-0.5 rounded-full border border-white/10">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-[#94A3B8]">
                      <strong className="text-[#F8FAFC]">{item.seats_allocated}</strong> / {item.seats_total} seats filled
                    </span>

                    <button
                      onClick={() => handleApply(item.id)}
                      disabled={hasApplied || applyingId === item.id}
                      className={
                        hasApplied
                          ? "px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 text-emerald-400 border border-emerald-500/30 cursor-default"
                          : "btn-primary-gradient px-4 py-1.5 rounded-full text-xs font-bold"
                      }
                    >
                      <span>{hasApplied ? 'Applied ✓' : applyingId === item.id ? 'Applying...' : 'Apply Now'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
