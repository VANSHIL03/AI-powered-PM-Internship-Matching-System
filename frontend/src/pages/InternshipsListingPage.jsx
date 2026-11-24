import React, { useState, useEffect } from 'react';
import { internshipsAPI, studentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  MapPin, 
  Building2, 
  Briefcase, 
  Sparkles,
  ArrowRight
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
    <div className="bg-[#000000] text-white min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2997FF] bg-[#2997FF]/15 px-3 py-1 rounded-full border border-[#2997FF]/30">
              National Opportunity Catalog
            </span>
            <h1 className="text-4xl font-black apple-text-gradient mt-2">
              Explore 30+ Vacancies.
            </h1>
            <p className="text-xs text-[#86868B] mt-1">
              Filter by industry sector, geographic preference, or required technical competencies.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('ai-matching')}
            className="px-5 py-2.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold transition flex items-center space-x-1.5 shadow-lg shadow-blue-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Check My AI Match Ranking</span>
          </button>
        </div>

        {toast && (
          <div className="p-4 rounded-2xl bg-[#30D158]/15 border border-[#30D158]/30 text-[#30D158] text-xs font-semibold flex items-center justify-between">
            <span>{toast}</span>
            <button onClick={() => setToast('')} className="text-white hover:opacity-80">✕</button>
          </div>
        )}

        {/* Filter Controls (Apple Glass) */}
        <div className="p-5 rounded-3xl bg-[#161617] border border-white/10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by role title, enterprise name, or required skill..."
                className="w-full pl-10 pr-3 py-2.5 rounded-full bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#2997FF]"
              />
            </div>

            <div>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-full bg-black/60 border border-white/10 text-xs text-white"
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
                className="w-full px-3.5 py-2.5 rounded-full bg-black/60 border border-white/10 text-xs text-white"
              >
                <option value="All">All Locations ({locations.length - 1})</option>
                {locations.filter(l => l !== 'All').map((loc, i) => (
                  <option key={i} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs pt-3 border-t border-white/10 gap-3 text-[#86868B]">
            <div className="flex items-center space-x-5">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={remoteOnly}
                  onChange={(e) => setRemoteOnly(e.target.checked)}
                  className="rounded text-[#0071E3] focus:ring-0 bg-black/60 border-white/20"
                />
                <span>Remote Only</span>
              </label>

              <div className="flex items-center space-x-2">
                <span>Min Stipend:</span>
                <select
                  value={minStipend}
                  onChange={(e) => setMinStipend(Number(e.target.value))}
                  className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-white text-xs"
                >
                  <option value={0}>Any</option>
                  <option value={18000}>₹18,000+</option>
                  <option value={20000}>₹20,000+</option>
                  <option value={25000}>₹25,000+</option>
                </select>
              </div>
            </div>

            <div>
              Showing <strong>{filtered.length}</strong> of {internships.length} opportunities
            </div>
          </div>
        </div>

        {/* Bento Grid of Opportunities */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-xs">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2997FF] mx-auto mb-3"></div>
            <span>Loading vacancies...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-[#86868B] text-xs bg-[#161617] rounded-3xl border border-white/10">
            <Briefcase className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <span>No opportunities match your filter criteria. Try resetting filters.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item) => {
              const hasApplied = appliedIds.has(item.id);
              return (
                <div 
                  key={item.id}
                  className="p-6 rounded-3xl bg-[#161617] border border-white/10 hover:border-white/25 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#2997FF] bg-[#2997FF]/15 px-2.5 py-0.5 rounded-full border border-[#2997FF]/30">
                        {item.sector}
                      </span>
                      <span className="text-xs font-black text-[#30D158] bg-[#30D158]/15 px-2.5 py-0.5 rounded-full border border-[#30D158]/30">
                        ₹{item.stipend_amount?.toLocaleString('en-IN')}/mo
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-[#2997FF] transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <div className="text-xs text-[#86868B] font-medium mb-3">
                      {item.company_name}
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-[#86868B] mb-4">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.is_remote ? 'Remote' : item.location}</span>
                      <span>•</span>
                      <span>{item.duration_months} Months</span>
                      <span>•</span>
                      <span>Min CGPA: <strong className="text-white">{item.min_cgpa}</strong></span>
                    </div>

                    {/* Skills Chips */}
                    <div className="space-y-1.5 mb-4">
                      <div className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider">Required Skills</div>
                      <div className="flex flex-wrap gap-1">
                        {item.required_skills?.map((s, idx) => (
                          <span key={idx} className="text-[10px] font-medium bg-white/5 text-slate-300 px-2 py-0.5 rounded-full border border-white/10">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-[#86868B]">
                      <strong className="text-white">{item.seats_allocated}</strong> / {item.seats_total} filled
                    </span>

                    <button
                      onClick={() => handleApply(item.id)}
                      disabled={hasApplied || applyingId === item.id}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center space-x-1 ${
                        hasApplied 
                          ? 'bg-white/10 text-[#30D158] border border-[#30D158]/30'
                          : 'bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-xs'
                      }`}
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
