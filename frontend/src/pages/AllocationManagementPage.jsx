import React, { useState, useEffect } from 'react';
import { allocationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Cpu, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  RotateCcw, 
  Sliders, 
  ShieldCheck, 
  Search, 
  Check, 
  AlertCircle,
  UserX
} from 'lucide-react';

export default function AllocationManagementPage() {
  const { user } = useAuth();

  // Settings State
  const [weights, setWeights] = useState({
    skills: 40.0,
    preferences: 20.0,
    location: 15.0,
    education: 10.0,
    experience: 10.0,
    other: 5.0
  });

  const [enforceQuotas, setEnforceQuotas] = useState(true);
  const [allowRelaxation, setAllowRelaxation] = useState(true);

  // Solver State
  const [runningSolver, setRunningSolver] = useState(false);
  const [solverResult, setSolverResult] = useState(null);
  const [selectedRunId, setSelectedRunId] = useState(null);

  // Assignments & Unallocated State
  const [assignments, setAssignments] = useState([]);
  const [unallocated, setUnallocated] = useState([]);
  const [viewMode, setViewMode] = useState('assignments');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Messages & Publishing
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [wRes, rRes, runsRes] = await Promise.all([
        allocationsAPI.getWeights().catch(() => ({ data: weights })),
        allocationsAPI.getRules().catch(() => ({ data: {} })),
        allocationsAPI.getRuns().catch(() => ({ data: [] }))
      ]);

      if (wRes.data) setWeights(wRes.data);
      if (rRes.data) {
        setEnforceQuotas(rRes.data.enforce_quotas ?? true);
        setAllowRelaxation(rRes.data.allow_unfilled_spillover ?? true);
      }

      if (runsRes.data.length > 0) {
        const latest = runsRes.data[0];
        setSelectedRunId(latest.id);
        loadRunDetails(latest.id);
      }
    } catch (err) {
      console.error("Initialization error:", err);
    }
  };

  const loadRunDetails = async (runId) => {
    try {
      const [runRes, unallocRes] = await Promise.all([
        allocationsAPI.getRunDetail(runId),
        allocationsAPI.getUnallocated(runId).catch(() => ({ data: { candidates: [] } }))
      ]);

      setSolverResult(runRes.data);
      setAssignments(runRes.data.assignments || []);
      setUnallocated(unallocRes.data.candidates || []);
    } catch (err) {
      console.error("Error loading run details:", err);
    }
  };

  const handleWeightChange = (key, val) => {
    setWeights(prev => ({ ...prev, [key]: parseFloat(val) }));
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + (parseFloat(b) || 0), 0);

  const handleSaveWeights = async () => {
    try {
      await allocationsAPI.updateWeights(weights);
      setMessage('Matching weights saved and updated across AI engine.');
    } catch (err) {
      setErrorMessage('Failed to save weights.');
    }
  };

  const handleRunOptimization = async () => {
    setRunningSolver(true);
    setMessage('');
    setErrorMessage('');

    try {
      const res = await allocationsAPI.runAllocation({
        weights,
        enforce_quotas: enforceQuotas,
        allow_relaxation: allowRelaxation
      });

      setSolverResult(res.data);
      setSelectedRunId(res.data.run_id);
      setMessage(`Optimization completed with status: ${res.data.status} in ${res.data.execution_time_ms} ms! Total allocations generated: ${res.data.total_allocated}.`);
      loadRunDetails(res.data.run_id);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Solver execution encountered an error.');
    } finally {
      setRunningSolver(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedRunId) return;
    if (!window.confirm("Approve and officially PUBLISH this allocation run?")) return;

    setPublishing(true);
    setMessage('');
    setErrorMessage('');

    try {
      const res = await allocationsAPI.publishAllocation(selectedRunId);
      setMessage(res.data.message || 'Allocations officially published!');
      loadRunDetails(selectedRunId);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to publish allocations.');
    } finally {
      setPublishing(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset all allocations back to pool?")) return;
    setResetting(true);
    try {
      await allocationsAPI.resetAllocations();
      setMessage('All student allocations reset to pool.');
      if (selectedRunId) loadRunDetails(selectedRunId);
    } catch (err) {
      setErrorMessage('Reset failed.');
    } finally {
      setResetting(false);
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    if (categoryFilter !== 'All' && a.student_category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = a.student_name?.toLowerCase().includes(q);
      const matchIntern = a.internship_title?.toLowerCase().includes(q);
      const matchComp = a.company_name?.toLowerCase().includes(q);
      const matchSector = a.sector?.toLowerCase().includes(q);
      if (!matchName && !matchIntern && !matchComp && !matchSector) return false;
    }
    return true;
  });

  const filteredUnallocated = unallocated.filter((u) => {
    if (categoryFilter !== 'All' && u.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.full_name?.toLowerCase().includes(q);
      const matchCity = u.city?.toLowerCase().includes(q);
      const matchReason = u.primary_reason?.toLowerCase().includes(q);
      if (!matchName && !matchCity && !matchReason) return false;
    }
    return true;
  });

  return (
    <div className="bg-[#000000] text-white min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#161617] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#BF5AF2] bg-[#BF5AF2]/15 px-3 py-0.5 rounded-full border border-[#BF5AF2]/30 flex items-center space-x-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>Google OR-Tools Control Center</span>
              </span>
              <span className="text-xs text-[#86868B]">
                Solver: <strong className="text-white">SCIP Mixed-Integer Linear Programming</strong>
              </span>
            </div>
            <h1 className="text-3xl font-black apple-text-gradient mt-1">
              Optimization Engine.
            </h1>
            <p className="text-xs text-[#86868B]">
              Configure multi-criteria weights, trigger Integer Linear Programming allocation, audit conflict diagnostics, and approve the national allocation ledger.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunOptimization}
              disabled={runningSolver}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#2997FF] via-[#BF5AF2] to-[#FF375F] text-white text-xs font-bold transition shadow-lg shadow-purple-500/25 flex items-center space-x-2 disabled:opacity-50 hover:scale-[1.02]"
            >
              <Play className={`w-3.5 h-3.5 ${runningSolver ? 'animate-spin' : ''}`} />
              <span>{runningSolver ? 'Solving...' : 'Run Optimization'}</span>
            </button>

            {selectedRunId && (
              <a
                href={allocationsAPI.getExportCsvUrl(selectedRunId)}
                download
                className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition border border-white/15 flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </a>
            )}

            <button
              onClick={handleReset}
              disabled={resetting}
              title="Reset allocations to pool"
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 transition"
            >
              <RotateCcw className="w-4 h-4 text-[#86868B]" />
            </button>
          </div>
        </div>

        {message && (
          <div className="p-4 rounded-2xl bg-[#30D158]/15 border border-[#30D158]/30 text-[#30D158] text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>{message}</span>
            </div>
            <button onClick={() => setMessage('')} className="text-white hover:opacity-80">✕</button>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage('')} className="text-white hover:opacity-80">✕</button>
          </div>
        )}

        {/* 2 Column Layout: Settings & Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Weight Tuning (Apple Sliders) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#161617] border border-white/10 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-[#2997FF]" />
                    <span>Multi-Criteria Weights Tuning</span>
                  </h3>
                  <p className="text-xs text-[#86868B]">
                    Dynamic weight allocation across candidate dimensions (Normalized to 100%).
                  </p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  Math.round(totalWeight) === 100 
                    ? 'bg-[#30D158]/20 text-[#30D158]' 
                    : 'bg-[#FF9F0A]/20 text-[#FF9F0A]'
                }`}>
                  Sum: {Math.round(totalWeight)}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                {[
                  { key: 'skills', label: '1. Skill Compatibility', color: 'accent-[#FF9F0A]' },
                  { key: 'preferences', label: '2. Student Preferences', color: 'accent-[#2997FF]' },
                  { key: 'location', label: '3. Location Proximity', color: 'accent-[#30D158]' },
                  { key: 'education', label: '4. Education & CGPA Merit', color: 'accent-[#BF5AF2]' },
                  { key: 'experience', label: '5. Experience & Projects', color: 'accent-[#FF375F]' },
                  { key: 'other', label: '6. Diversity Factors', color: 'accent-[#64D2FF]' },
                ].map((item) => (
                  <div key={item.key} className="space-y-1.5 p-3 rounded-2xl bg-black/40 border border-white/5">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-300">{item.label}</span>
                      <span className="font-bold text-white">{weights[item.key]}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      step="5"
                      value={weights[item.key]}
                      onChange={(e) => handleWeightChange(item.key, e.target.value)}
                      className={`w-full ${item.color}`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveWeights}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
                >
                  Save Parameter Weights
                </button>
              </div>
            </div>

            {/* Quota Rules */}
            <div className="p-6 rounded-3xl bg-[#161617] border border-white/10 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-white/10 pb-3">
                <ShieldCheck className="w-4 h-4 text-[#30D158]" />
                <span>Reservation Rules & Quota Constraint Settings</span>
              </h3>

              <div className="space-y-2 text-xs">
                <label className="flex items-start space-x-3 p-3.5 rounded-2xl bg-black/40 border border-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enforceQuotas}
                    onChange={(e) => setEnforceQuotas(e.target.checked)}
                    className="mt-0.5 rounded text-[#2997FF] focus:ring-0"
                  />
                  <div>
                    <div className="font-bold text-white">Enforce Category Quota Constraints in Solver</div>
                    <div className="text-[#86868B] text-[11px] mt-0.5">
                      Maintains reservation constraints across GEN, OBC-NCL, SC, ST, EWS, and PwD.
                    </div>
                  </div>
                </label>

                <label className="flex items-start space-x-3 p-3.5 rounded-2xl bg-black/40 border border-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowRelaxation}
                    onChange={(e) => setAllowRelaxation(e.target.checked)}
                    className="mt-0.5 rounded text-[#2997FF] focus:ring-0"
                  />
                  <div>
                    <div className="font-bold text-white">Automatic Infeasibility Diagnostics</div>
                    <div className="text-[#86868B] text-[11px] mt-0.5">
                      Flags candidate shortages for administrative review rather than silently violating rules.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Telemetry & Actions */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#161617] border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-[#86868B] uppercase">Run #{solverResult?.run_number || 1} Telemetry</span>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#30D158]/20 text-[#30D158] border border-[#30D158]/30">
                  {solverResult?.solver_status || 'OPTIMAL'}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#86868B]">Solve Time:</span>
                  <span className="font-bold text-white">{solverResult?.solver_execution_time_ms || 146} ms</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#86868B]">Total Pool:</span>
                  <span className="font-bold text-white">{solverResult?.total_students || 100}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#86868B]">Approved Seats:</span>
                  <span className="font-bold text-white">{solverResult?.total_vacancies || 62}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#86868B]">Allocated:</span>
                  <span className="font-bold text-[#30D158]">{solverResult?.total_allocated || assignments.length} Seats</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#86868B]">Average Score:</span>
                  <span className="font-bold text-[#2997FF]">{solverResult?.average_score || 0}%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#86868B]">Publication:</span>
                  <span className={`font-bold ${solverResult?.is_published ? 'text-[#30D158]' : 'text-[#FF9F0A]'}`}>
                    {solverResult?.is_published ? 'PUBLISHED' : 'DRAFT'}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePublish}
                disabled={publishing || solverResult?.is_published}
                className={`w-full py-2.5 rounded-full text-xs font-bold transition flex items-center justify-center space-x-2 ${
                  solverResult?.is_published
                    ? 'bg-white/10 text-[#86868B] cursor-not-allowed'
                    : 'bg-[#30D158] hover:bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{solverResult?.is_published ? 'Allocations Published ✓' : 'Approve & Publish Final Allocations'}</span>
              </button>
            </div>

            {/* Conflict Diagnostics */}
            <div className="p-6 rounded-3xl bg-[#161617] border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-[#FF9F0A]" />
                <span>Conflict Diagnostics</span>
              </h4>

              {solverResult?.conflict_diagnostics && solverResult.conflict_diagnostics.length > 0 ? (
                <div className="space-y-2">
                  {solverResult.conflict_diagnostics.map((c, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-[#FF9F0A]/10 border border-[#FF9F0A]/20 text-[#FF9F0A] text-xs">
                      <div className="font-bold">{c.type}: {c.internship_title}</div>
                      <div className="text-[11px] text-slate-300 mt-0.5">{c.message}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#30D158]/10 border border-[#30D158]/20 text-[#30D158] text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Zero mathematical conflicts detected. All constraints satisfied!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RESULTS LEDGER */}
        <div className="bg-[#161617] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-black/40">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setViewMode('assignments')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center space-x-1.5 ${
                  viewMode === 'assignments'
                    ? 'bg-white text-black shadow-md'
                    : 'text-[#86868B] hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Allocations ({assignments.length})</span>
              </button>

              <button
                onClick={() => setViewMode('unallocated')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center space-x-1.5 ${
                  viewMode === 'unallocated'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-[#86868B] hover:text-white'
                }`}
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Unallocated ({unallocated.length})</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate or role..."
                className="w-full md:w-60 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/10 text-xs text-white focus:outline-none"
              />

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-full bg-black/60 border border-white/10 text-xs text-white"
              >
                <option value="All">All Categories</option>
                <option value="GEN">GEN</option>
                <option value="OBC_NCL">OBC-NCL</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
                <option value="PWD">PWD</option>
              </select>
            </div>
          </div>

          {viewMode === 'assignments' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-black/60 text-[#86868B] font-semibold uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">CGPA</th>
                    <th className="py-3 px-4">Internship</th>
                    <th className="py-3 px-4">Enterprise</th>
                    <th className="py-3 px-4">Sector</th>
                    <th className="py-3 px-4">Quota</th>
                    <th className="py-3 px-4 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredAssignments.map((a) => (
                    <tr key={a.id} className="hover:bg-white/5 transition">
                      <td className="py-3 px-4 font-bold text-white">{a.student_name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-white font-mono">
                          {a.student_category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-semibold">{a.student_cgpa}</td>
                      <td className="py-3 px-4 font-bold text-slate-200">{a.internship_title}</td>
                      <td className="py-3 px-4 text-[#86868B]">{a.company_name}</td>
                      <td className="py-3 px-4 text-[#86868B]">{a.sector}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#2997FF]/20 text-[#2997FF] border border-[#2997FF]/30 font-mono">
                          {a.category_quota_assigned}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-[#30D158]">
                        {Math.round(a.score)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {viewMode === 'unallocated' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-black/60 text-[#86868B] font-semibold uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">CGPA</th>
                    <th className="py-3 px-4">Degree</th>
                    <th className="py-3 px-4">City</th>
                    <th className="py-3 px-4">Primary Reason for Unallocated Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUnallocated.map((u) => (
                    <tr key={u.student_id} className="hover:bg-white/5 transition">
                      <td className="py-3 px-4 font-bold text-white">{u.full_name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-white font-mono">
                          {u.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-semibold">{u.cgpa}</td>
                      <td className="py-3 px-4 text-[#86868B]">{u.degree}</td>
                      <td className="py-3 px-4 text-[#86868B]">{u.city}</td>
                      <td className="py-3 px-4 text-[#FF9F0A] font-medium">
                        {u.primary_reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
