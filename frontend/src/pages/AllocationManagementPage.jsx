import React, { useState, useEffect } from 'react';
import { allocationsAPI, analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Cpu, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  RotateCcw, 
  Send, 
  Sliders, 
  ShieldCheck, 
  Layers, 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Check, 
  AlertCircle,
  HelpCircle,
  UserX,
  FileCheck2
} from 'lucide-react';

export default function AllocationManagementPage() {
  const { user, isAdmin } = useAuth();

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
  const [runsHistory, setRunsHistory] = useState([]);
  const [selectedRunId, setSelectedRunId] = useState(null);

  // Assignments & Unallocated State
  const [assignments, setAssignments] = useState([]);
  const [unallocated, setUnallocated] = useState([]);
  const [viewMode, setViewMode] = useState('assignments'); // 'assignments', 'unallocated'
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

      setRunsHistory(runsRes.data);
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
      
      // Refresh runs list and details
      const runsRes = await allocationsAPI.getRuns();
      setRunsHistory(runsRes.data);
      loadRunDetails(res.data.run_id);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Solver execution encountered an error.');
    } finally {
      setRunningSolver(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedRunId) return;
    if (!window.confirm("Are you sure you want to officially APPROVE and PUBLISH this allocation run? This will notify candidates and update enterprise seat rosters.")) return;

    setPublishing(true);
    setMessage('');
    setErrorMessage('');

    try {
      const res = await allocationsAPI.publishAllocation(selectedRunId);
      setMessage(res.data.message || 'Allocations officially published!');
      loadRunDetails(selectedRunId);
      const runsRes = await allocationsAPI.getRuns();
      setRunsHistory(runsRes.data);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to publish allocations.');
    } finally {
      setPublishing(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset all student allocations and vacancy seats back to UNALLOCATED?")) return;
    setResetting(true);
    try {
      await allocationsAPI.resetAllocations();
      setMessage('All allocations reset to unallocated pool.');
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
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Admin Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-300 flex items-center space-x-1">
              <Cpu className="w-3.5 h-3.5 text-purple-600" />
              <span>National Allocation Engine Control Panel</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Backend: <strong>Google OR-Tools MIP (SCIP)</strong>
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            Constraint-Aware Allocation & Optimization
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure multi-criteria weights, enforce illustrative reservation quotas, run Integer Linear Programming, and approve allocations.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRunOptimization}
            disabled={runningSolver}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-bold transition shadow-md flex items-center space-x-2 disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${runningSolver ? 'animate-spin' : ''}`} />
            <span>{runningSolver ? 'Solving ILP Problem...' : 'Run Optimization Engine'}</span>
          </button>

          {selectedRunId && (
            <a
              href={allocationsAPI.getExportCsvUrl(selectedRunId)}
              download
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </a>
          )}

          <button
            onClick={handleReset}
            disabled={resetting}
            title="Reset allocations to pool"
            className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage('')} className="text-emerald-700 hover:text-emerald-900">✕</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-rose-700 hover:text-rose-900">✕</button>
        </div>
      )}

      {/* Two Column Layout: Configuration Controls + Solver Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Weight & Quota Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Matching Weights Sliders */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-purple-600" />
                  <span>Configurable Multi-Criteria Scoring Weights</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Adjust weighting parameters across candidate dimensions (Auto-normalized to 100%).
                </p>
              </div>

              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                Math.round(totalWeight) === 100 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                Sum: {Math.round(totalWeight)}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Skills */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>1. Skill Compatibility</span>
                  <span className="font-bold text-slate-900">{weights.skills}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  step="5"
                  value={weights.skills}
                  onChange={(e) => handleWeightChange('skills', e.target.value)}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Preferences */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>2. Student Preferences</span>
                  <span className="font-bold text-slate-900">{weights.preferences}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="5"
                  value={weights.preferences}
                  onChange={(e) => handleWeightChange('preferences', e.target.value)}
                  className="w-full accent-blue-500"
                />
              </div>

              {/* Location */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>3. Location Compatibility</span>
                  <span className="font-bold text-slate-900">{weights.location}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="5"
                  value={weights.location}
                  onChange={(e) => handleWeightChange('location', e.target.value)}
                  className="w-full accent-emerald-500"
                />
              </div>

              {/* Education */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>4. Education & CGPA Merit</span>
                  <span className="font-bold text-slate-900">{weights.education}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={weights.education}
                  onChange={(e) => handleWeightChange('education', e.target.value)}
                  className="w-full accent-purple-500"
                />
              </div>

              {/* Experience */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>5. Experience & Projects</span>
                  <span className="font-bold text-slate-900">{weights.experience}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={weights.experience}
                  onChange={(e) => handleWeightChange('experience', e.target.value)}
                  className="w-full accent-indigo-500"
                />
              </div>

              {/* Other */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>6. Diversity & Other Factors</span>
                  <span className="font-bold text-slate-900">{weights.other}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={weights.other}
                  onChange={(e) => handleWeightChange('other', e.target.value)}
                  className="w-full accent-teal-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSaveWeights}
                className="px-4 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold"
              >
                Save Matching Weights
              </button>
            </div>
          </div>

          {/* Reservation Quotas & Constraints Settings */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Reservation Quotas & Hard Constraints Management</span>
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enforceQuotas}
                  onChange={(e) => setEnforceQuotas(e.target.checked)}
                  className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <div className="font-bold text-slate-900">Enforce Category Seat Reservations in OR-Tools</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Solves with category reservation constraints for GEN, OBC-NCL, SC, ST, EWS, PwD.
                  </div>
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowRelaxation}
                  onChange={(e) => setAllowRelaxation(e.target.checked)}
                  className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <div className="font-bold text-slate-900">Infeasibility Diagnostic & Soft Penalty Relaxation</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    If eligible applicants in a category are fewer than reserved seats, solver flags the exact shortage for Admin Review rather than silently violating rules.
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Col: Solver Execution Status & Conflict Diagnostics */}
        <div className="space-y-6">
          {/* Current Solver Run Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Run #{solverResult?.run_number || 1} Status
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
                solverResult?.solver_status === 'OPTIMAL'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}>
                {solverResult?.solver_status || 'READY'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Execution Speed:</span>
                <span className="font-bold text-slate-900">{solverResult?.solver_execution_time_ms || 146} ms</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Candidates Evaluated:</span>
                <span className="font-bold text-slate-900">{solverResult?.total_students || 100}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Total Vacancy Seats:</span>
                <span className="font-bold text-slate-900">{solverResult?.total_vacancies || 62}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Successful Allocations:</span>
                <span className="font-bold text-emerald-700">{solverResult?.total_allocated || assignments.length}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Average Compatibility:</span>
                <span className="font-bold text-slate-900">{solverResult?.average_score || 0}%</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Publication Status:</span>
                <span className={`font-bold ${solverResult?.is_published ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {solverResult?.is_published ? 'OFFICIALLY PUBLISHED' : 'DRAFT / PROPOSED'}
                </span>
              </div>
            </div>

            {/* Official Publish Action */}
            <div className="pt-2">
              <button
                onClick={handlePublish}
                disabled={publishing || solverResult?.is_published}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-xs ${
                  solverResult?.is_published
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{solverResult?.is_published ? 'Allocations Published ✓' : 'Approve & Publish Final Allocations'}</span>
              </button>
              <div className="text-[10px] text-slate-400 text-center mt-1">
                *Requires admin authorization before candidates see offers
              </div>
            </div>
          </div>

          {/* Conflict Diagnostics & Infeasibility Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Conflict & Shortfall Diagnostics</span>
            </h4>

            {solverResult?.conflict_diagnostics && solverResult.conflict_diagnostics.length > 0 ? (
              <div className="space-y-2">
                {solverResult.conflict_diagnostics.map((c, i) => (
                  <div key={i} className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    <div className="font-bold text-[11px] text-amber-800">{c.type}: {c.internship_title}</div>
                    <div className="text-[11px] mt-0.5">{c.message}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero mathematical conflicts detected. All hard constraints and capacity bounds satisfied!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ALLOCATION RESULTS & UNALLOCATED CANDIDATE INSPECTOR */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Sub-Header Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewMode('assignments')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                viewMode === 'assignments'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Successful Allocations ({assignments.length})</span>
            </button>

            <button
              onClick={() => setViewMode('unallocated')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                viewMode === 'unallocated'
                  ? 'bg-rose-800 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Unallocated Candidates ({unallocated.length})</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate, role..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-700 focus:outline-none bg-white"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2 py-1.5 rounded-xl border border-slate-300 text-xs bg-white font-medium"
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

        {/* View Mode 1: Successful Assignments Table */}
        {viewMode === 'assignments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">CGPA</th>
                  <th className="py-3 px-4">Allocated Internship</th>
                  <th className="py-3 px-4">Enterprise</th>
                  <th className="py-3 px-4">Sector</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Quota Allotted</th>
                  <th className="py-3 px-4 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssignments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{a.student_name}</div>
                      <div className="text-[11px] text-slate-500">{a.student_email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {a.student_category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{a.student_cgpa}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{a.internship_title}</td>
                    <td className="py-3 px-4 text-slate-700">{a.company_name}</td>
                    <td className="py-3 px-4 text-slate-600">{a.sector}</td>
                    <td className="py-3 px-4 text-slate-600">{a.location}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 font-mono">
                        {a.category_quota_assigned}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        {Math.round(a.score)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* View Mode 2: Unallocated Candidates Table with Explainability */}
        {viewMode === 'unallocated' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">CGPA</th>
                  <th className="py-3 px-4">Degree</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Primary Reason for Unallocated Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUnallocated.map((u) => (
                  <tr key={u.student_id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{u.full_name}</div>
                      <div className="text-[11px] text-slate-500">{u.registration_number}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {u.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{u.cgpa}</td>
                    <td className="py-3 px-4 text-slate-700">{u.degree}</td>
                    <td className="py-3 px-4 text-slate-600">{u.city}</td>
                    <td className="py-3 px-4 text-amber-800 bg-amber-50/50 font-medium">
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
  );
}
