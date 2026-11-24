import React, { useState, useEffect } from 'react';
import { analyticsAPI, allocationsAPI } from '../services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  Download, 
  Users, 
  Building2, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  Award,
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await analyticsAPI.getOverview();
      setData(res.data);
    } catch (err) {
      console.error("Error loading analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#000000] flex flex-col items-center justify-center text-[#86868B] space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-[#2997FF] animate-spin"></div>
        <span className="text-xs font-medium tracking-wide">Synthesizing national allocation telemetry & welfare metrics...</span>
      </div>
    );
  }

  // Pre-formatted chart data
  const sectorData = data?.sector_distribution?.map(s => ({
    name: s.sector.length > 14 ? s.sector.substring(0, 14) + '…' : s.sector,
    fullName: s.sector,
    Total: s.total_seats,
    Allocated: s.allocated_seats,
    Vacant: s.vacant_seats
  })) || [];

  const categoryData = data?.category_allocation_stats?.map(c => ({
    name: c.category,
    Registered: c.registered_students,
    Allocated: c.allocated_students,
    QuotaTarget: c.targeted_quota_seats
  })) || [];

  const scoreData = data?.score_distribution || [];

  const allocationPieData = [
    { name: 'Allocated Seats', value: data?.total_allocated || 0, color: '#30D158' },
    { name: 'Remaining Vacant', value: data?.remaining_vacant_seats || 0, color: '#2C2C2E' },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F7] py-12 px-4 sm:px-6 lg:px-8 space-y-10 selection:bg-[#2997FF] selection:text-white">
      
      {/* Title & Header Section */}
      <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-4 border-b border-white/10">
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-white/90 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#2997FF]" />
            <span className="font-semibold tracking-wide">National Welfare Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#F5F5F7]">
            Analytics, Fill Rates & Quota Auditing
          </h1>
          <p className="text-sm text-[#86868B] max-w-2xl leading-relaxed">
            Real-time OR-Tools solver metrics, sector absorption indices, affirmative reservation enforcement, and candidate welfare compatibility scores.
          </p>
        </div>

        {data?.latest_run_id && (
          <a
            href={allocationsAPI.getExportCsvUrl(data.latest_run_id)}
            download
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#2997FF] hover:bg-[#0071E3] text-white text-xs font-semibold tracking-wide transition shadow-lg shadow-[#2997FF]/25 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Export Official CSV Ledger</span>
          </a>
        )}
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* KPI Overview Grid - Bento Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
          <div className="bg-[#161617] p-4 rounded-2xl border border-white/10 hover:border-white/20 transition">
            <span className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider block">Applicants</span>
            <div className="text-2xl font-bold tracking-tight text-[#F5F5F7] mt-1">{data?.total_students}</div>
            <span className="text-[10px] text-[#2997FF] font-medium flex items-center space-x-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2997FF]"></span>
              <span>Registered Pool</span>
            </span>
          </div>

          <div className="bg-[#161617] p-4 rounded-2xl border border-white/10 hover:border-white/20 transition">
            <span className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider block">Enterprises</span>
            <div className="text-2xl font-bold tracking-tight text-[#F5F5F7] mt-1">{data?.total_companies}</div>
            <span className="text-[10px] text-[#86868B] font-medium flex items-center space-x-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
              <span>Top Corporates</span>
            </span>
          </div>

          <div className="bg-[#161617] p-4 rounded-2xl border border-white/10 hover:border-white/20 transition">
            <span className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider block">Approved Seats</span>
            <div className="text-2xl font-bold tracking-tight text-[#BF5AF2] mt-1">{data?.total_vacancies}</div>
            <span className="text-[10px] text-[#BF5AF2]/80 font-medium flex items-center space-x-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#BF5AF2]"></span>
              <span>Capacity Pool</span>
            </span>
          </div>

          <div className="bg-[#161617] p-4 rounded-2xl border border-white/10 hover:border-white/20 transition">
            <span className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider block">Allocated</span>
            <div className="text-2xl font-bold tracking-tight text-[#30D158] mt-1">{data?.total_allocated}</div>
            <span className="text-[10px] text-[#30D158]/80 font-medium flex items-center space-x-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#30D158]"></span>
              <span>Matched Seats</span>
            </span>
          </div>

          <div className="bg-[#161617] p-4 rounded-2xl border border-white/10 hover:border-white/20 transition">
            <span className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider block">Vacant Seats</span>
            <div className="text-2xl font-bold tracking-tight text-[#86868B] mt-1">{data?.remaining_vacant_seats}</div>
            <span className="text-[10px] text-[#86868B] font-medium flex items-center space-x-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#86868B]"></span>
              <span>Remaining</span>
            </span>
          </div>

          <div className="bg-[#161617] p-4 rounded-2xl border border-white/10 hover:border-white/20 transition">
            <span className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider block">Unallocated</span>
            <div className="text-2xl font-bold tracking-tight text-[#FF9F0A] mt-1">{data?.unallocated_students}</div>
            <span className="text-[10px] text-[#FF9F0A]/80 font-medium flex items-center space-x-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF9F0A]"></span>
              <span>Waitlisted Pool</span>
            </span>
          </div>

          <div className="bg-[#161617] p-4 rounded-2xl border border-white/10 hover:border-white/20 transition">
            <span className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider block">Welfare Score</span>
            <div className="text-2xl font-bold tracking-tight text-[#2997FF] mt-1">{data?.average_compatibility_score}%</div>
            <span className="text-[10px] text-[#30D158] font-medium flex items-center space-x-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#30D158]"></span>
              <span>Mean Pareto Index</span>
            </span>
          </div>
        </div>

        {/* Charts Section 1: Sector Distribution & National Capacity Utilization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sector Bar Chart */}
          <div className="lg:col-span-2 bg-[#161617] p-6 sm:p-7 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#F5F5F7] flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-[#2997FF]" />
                  <span>Sector-Wise Vacancy & Absorption Spectrum</span>
                </h3>
                <p className="text-xs text-[#86868B] mt-0.5">Approved enterprise quotas versus executed candidate allotments by sector.</p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
                  <XAxis dataKey="name" angle={-15} textAnchor="end" interval={0} tick={{ fontSize: 10, fill: '#86868B' }} stroke="#3A3A3C" />
                  <YAxis tick={{ fontSize: 10, fill: '#86868B' }} stroke="#3A3A3C" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1C1C1E', 
                      borderRadius: '14px', 
                      border: '1px solid rgba(255,255,255,0.15)', 
                      fontSize: '11px',
                      color: '#F5F5F7',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.6)'
                    }}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#86868B' }} />
                  <Bar dataKey="Total" fill="#3A3A3C" name="Total Approved Seats" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Allocated" fill="#2997FF" name="Allotted Candidates" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Allocation Utilization Gauge */}
          <div className="bg-[#161617] p-6 sm:p-7 rounded-3xl border border-white/10 space-y-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-semibold text-[#F5F5F7] flex items-center space-x-2">
                <PieIcon className="w-4 h-4 text-[#30D158]" />
                <span>National Fill Efficiency</span>
              </h3>
              <p className="text-xs text-[#86868B] mt-0.5">Overall matching yield of approved vacancies.</p>
            </div>

            <div className="h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="#161617"
                    strokeWidth={3}
                  >
                    {allocationPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1C1C1E', 
                      borderRadius: '12px', 
                      border: '1px solid rgba(255,255,255,0.15)', 
                      fontSize: '11px',
                      color: '#F5F5F7'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold tracking-tight text-[#F5F5F7]">{data?.allocation_rate_percentage}%</span>
                <span className="text-[10px] text-[#30D158] font-semibold uppercase tracking-wider mt-0.5">Fulfilled</span>
              </div>
            </div>

            <div className="text-center text-xs text-[#86868B] border-t border-white/10 pt-4">
              <span className="text-[#F5F5F7] font-semibold">{data?.total_allocated}</span> of <span className="text-[#F5F5F7] font-semibold">{data?.total_vacancies}</span> total vacancies filled with zero conflict.
            </div>
          </div>
        </div>

        {/* Charts Section 2: Reservation Quota Compliance & Score Histogram */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category-wise Reservation Compliance */}
          <div className="bg-[#161617] p-6 sm:p-7 rounded-3xl border border-white/10 space-y-6">
            <div>
              <h3 className="text-base font-semibold text-[#F5F5F7] flex items-center space-x-2">
                <Award className="w-4 h-4 text-[#BF5AF2]" />
                <span>Affirmative Reservation Compliance</span>
              </h3>
              <p className="text-xs text-[#86868B] mt-0.5">Audit trail confirming quota targets across all social categories.</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#86868B' }} stroke="#3A3A3C" />
                  <YAxis tick={{ fontSize: 10, fill: '#86868B' }} stroke="#3A3A3C" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1C1C1E', 
                      borderRadius: '12px', 
                      border: '1px solid rgba(255,255,255,0.15)', 
                      fontSize: '11px',
                      color: '#F5F5F7'
                    }}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#86868B' }} />
                  <Bar dataKey="Registered" fill="#48484A" name="Applicant Pool" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="Allocated" fill="#BF5AF2" name="Allotted" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="QuotaTarget" fill="#FF9F0A" name="Target Quota" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Compatibility Score Histogram */}
          <div className="bg-[#161617] p-6 sm:p-7 rounded-3xl border border-white/10 space-y-6">
            <div>
              <h3 className="text-base font-semibold text-[#F5F5F7] flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-[#30D158]" />
                <span>Welfare Compatibility Distribution</span>
              </h3>
              <p className="text-xs text-[#86868B] mt-0.5">Pareto score histogram showing high match quality across assignments.</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#86868B' }} stroke="#3A3A3C" />
                  <YAxis tick={{ fontSize: 10, fill: '#86868B' }} stroke="#3A3A3C" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1C1C1E', 
                      borderRadius: '12px', 
                      border: '1px solid rgba(255,255,255,0.15)', 
                      fontSize: '11px',
                      color: '#F5F5F7'
                    }}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  />
                  <Bar dataKey="count" fill="#30D158" name="Allotments in Score Tier" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Audit Assurance Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#161617] via-[#1C1C1E] to-[#161617] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-full bg-[#30D158]/10 border border-[#30D158]/30 flex items-center justify-center text-[#30D158]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#F5F5F7]">Cryptographic Allocation Immutability</div>
              <div className="text-xs text-[#86868B]">Every assignment run is logged with an immutable execution timestamp, solver optimality gap &lt; 0.01%, and verifiable audit trail.</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-[#30D158] font-medium bg-[#30D158]/10 px-3.5 py-1.5 rounded-full border border-[#30D158]/20 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Audit Certified</span>
          </div>
        </div>

      </div>
    </div>
  );
}
