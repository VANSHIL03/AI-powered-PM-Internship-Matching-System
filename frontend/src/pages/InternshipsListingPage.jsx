import React, { useState, useEffect } from 'react';
import { internshipsAPI, studentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Filter, 
  MapPin, 
  Building2, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Briefcase, 
  SlidersHorizontal,
  Sparkles
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

  // Filter client-side
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
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
            Official Vacancies Catalog
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            Explore 30+ Enterprise Internship Opportunities
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Filter by sector, location, or required technical competencies under PM Internship Scheme 2026.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('ai-matching')}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center space-x-1.5 hover:from-emerald-500 hover:to-emerald-600"
        >
          <Sparkles className="w-4 h-4" />
          <span>View My AI Match Scores</span>
        </button>
      </div>

      {toast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between">
          <span>{toast}</span>
          <button onClick={() => setToast('')} className="text-emerald-700 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by role title, enterprise name, or required skill..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F2A4A] focus:outline-none"
            />
          </div>

          {/* Sector filter */}
          <div>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F2A4A] focus:outline-none bg-white font-medium"
            >
              <option value="All">All Sectors ({sectors.length - 1})</option>
              {sectors.filter(s => s !== 'All').map((sec, i) => (
                <option key={i} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          {/* Location filter */}
          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F2A4A] focus:outline-none bg-white font-medium"
            >
              <option value="All">All Locations ({locations.length - 1})</option>
              {locations.filter(l => l !== 'All').map((loc, i) => (
                <option key={i} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-slate-100 gap-3">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700 font-semibold">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Remote Internships Only</span>
            </label>

            <div className="flex items-center space-x-2 text-slate-600">
              <span>Min Stipend:</span>
              <select
                value={minStipend}
                onChange={(e) => setMinStipend(Number(e.target.value))}
                className="px-2 py-1 rounded-lg border border-slate-200 text-xs bg-white"
              >
                <option value={0}>Any</option>
                <option value={18000}>₹18,000+</option>
                <option value={20000}>₹20,000+</option>
                <option value={25000}>₹25,000+</option>
              </select>
            </div>
          </div>

          <div className="text-slate-500">
            Showing <strong>{filtered.length}</strong> of {internships.length} opportunities
          </div>
        </div>
      </div>

      {/* Grid of Internship Cards */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-xs">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F2A4A] mx-auto mb-2"></div>
          <span>Loading vacancies...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs bg-white rounded-2xl border border-slate-200">
          <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <span>No internships match your filter criteria. Try resetting filters.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const hasApplied = appliedIds.has(item.id);
            const quotas = item.category_reservations || {};
            return (
              <div 
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {item.sector}
                    </span>
                    <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ₹{item.stipend_amount?.toLocaleString('en-IN')}/mo
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="text-xs font-semibold text-slate-600 mb-2">
                    {item.company_name}
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-500 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.is_remote ? 'Remote' : item.location}</span>
                    <span>•</span>
                    <span>{item.duration_months} Months</span>
                    <span>•</span>
                    <span>Min CGPA: <strong>{item.min_cgpa}</strong></span>
                  </div>

                  {/* Skills Chips */}
                  <div className="space-y-1.5 mb-3">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Required Skills</div>
                    <div className="flex flex-wrap gap-1">
                      {item.required_skills?.map((s, idx) => (
                        <span key={idx} className="text-[10px] font-medium bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Seat capacity & quota breakdown */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] mb-3">
                    <div className="flex items-center justify-between text-slate-700 font-semibold mb-1">
                      <span>Total Capacity:</span>
                      <span className="font-bold text-slate-900">{item.seats_total} Seats</span>
                    </div>
                    {Object.keys(quotas).length > 0 && (
                      <div className="flex items-center space-x-1 text-[10px] text-slate-500">
                        <span>Demo Quota:</span>
                        {Object.entries(quotas).map(([k, v]) => (
                          <span key={k} className="px-1 py-0.2 rounded bg-white border border-slate-200 font-mono">
                            {k}:{v}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {item.seats_allocated} / {item.seats_total} filled
                  </span>

                  <button
                    onClick={() => handleApply(item.id)}
                    disabled={hasApplied || applyingId === item.id}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                      hasApplied 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-[#0F2A4A] text-white hover:bg-[#0B1E36]'
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
  );
}
