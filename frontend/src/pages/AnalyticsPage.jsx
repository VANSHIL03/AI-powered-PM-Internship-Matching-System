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
  Award
} from 'lucide-react';

const COLORS = ['#107E54', '#0F2A4A', '#E5A93C', '#6366F1', '#EC4899', '#8B5CF6'];

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
      <div className="flex items-center justify-center p-16 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F2A4A] mr-3"></div>
        <span>Generating interactive analytics and distribution charts...</span>
      </div>
    );
  }

  // Pre-formatted chart data
  const sectorData = data?.sector_distribution?.map(s => ({
    name: s.sector.length > 15 ? s.sector.substring(0, 15) + '...' : s.sector,
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
    { name: 'Allocated Seats', value: data?.total_allocated || 0, color: '#107E54' },
    { name: 'Remaining Vacant', value: data?.remaining_vacant_seats || 0, color: '#E2E8F0' },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Title Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-300">
            National Allocation Intelligence
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            Analytics, Distribution & Welfare Reporting
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time monitoring of seat fill rates, sector distribution, reservation compliance, and compatibility metrics.
          </p>
        </div>

        {data?.latest_run_id && (
          <a
            href={allocationsAPI.getExportCsvUrl(data.latest_run_id)}
            download
            className="px-4 py-2.5 rounded-xl bg-[#0F2A4A] hover:bg-[#0B1E36] text-white text-xs font-bold transition shadow-xs flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Official CSV Report</span>
          </a>
        )}
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Students</span>
          <div className="text-xl font-black text-slate-900 mt-1">{data?.total_students}</div>
          <span className="text-[10px] text-blue-600 font-semibold">Registered Pool</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Companies</span>
          <div className="text-xl font-black text-slate-900 mt-1">{data?.total_companies}</div>
          <span className="text-[10px] text-slate-500">Participating</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Vacancies</span>
          <div className="text-xl font-black text-purple-700 mt-1">{data?.total_vacancies}</div>
          <span className="text-[10px] text-purple-600 font-semibold">Approved Seats</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Allocated</span>
          <div className="text-xl font-black text-emerald-700 mt-1">{data?.total_allocated}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">Matched Seats</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Vacant Seats</span>
          <div className="text-xl font-black text-slate-600 mt-1">{data?.remaining_vacant_seats}</div>
          <span className="text-[10px] text-slate-500">Remaining</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Unallocated</span>
          <div className="text-xl font-black text-amber-700 mt-1">{data?.unallocated_students}</div>
          <span className="text-[10px] text-amber-600 font-semibold">In Pool</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Avg Compatibility</span>
          <div className="text-xl font-black text-blue-900 mt-1">{data?.average_compatibility_score}%</div>
          <span className="text-[10px] text-emerald-600 font-bold">Welfare Score</span>
        </div>
      </div>

      {/* Charts Section 1: Sector Distribution & Capacity Fill */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sector Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>Sector-Wise Vacancy & Allocation Breakdown</span>
              </h3>
              <p className="text-xs text-slate-500">Total capacity vs successfully filled seats per industry sector.</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" angle={-15} textAnchor="end" interval={0} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Total" fill="#CBD5E1" name="Total Seats" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Allocated" fill="#107E54" name="Allocated Seats" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Allocation Utilization Gauge */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-blue-600" />
              <span>National Fill Rate</span>
            </h3>
            <p className="text-xs text-slate-500">Overall seat allocation efficiency.</p>
          </div>

          <div className="h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {allocationPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-900">{data?.allocation_rate_percentage}%</span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Filled</span>
            </div>
          </div>

          <div className="text-center text-xs text-slate-600 border-t border-slate-100 pt-3">
            <strong>{data?.total_allocated}</strong> of <strong>{data?.total_vacancies}</strong> internship seats allotted via OR-Tools optimization.
          </div>
        </div>
      </div>

      {/* Charts Section 2: Reservation Quota Compliance & Score Histogram */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category-wise Reservation Compliance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Award className="w-4 h-4 text-purple-600" />
              <span>Category-Wise Reservation & Allocation Roster</span>
            </h3>
            <p className="text-xs text-slate-500">Demonstrating constraint fulfillment across illustrative reservation categories.</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Registered" fill="#94A3B8" name="Applicants" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Allocated" fill="#0F2A4A" name="Allocated" radius={[4, 4, 0, 0]} />
                <Bar dataKey="QuotaTarget" fill="#E5A93C" name="Quota Target" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compatibility Score Histogram */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <span>Compatibility Score Distribution Histogram</span>
            </h3>
            <p className="text-xs text-slate-500">Distribution of compatibility scores among allocated assignments.</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', fontSize: '11px' }} />
                <Bar dataKey="count" fill="#6366F1" name="Assignments in Bracket" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
