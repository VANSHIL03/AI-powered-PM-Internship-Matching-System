import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI } from '../services/api';
import { 
  ShieldCheck, 
  Sparkles, 
  Cpu, 
  GraduationCap, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Layers, 
  BarChart3,
  Award,
  Zap,
  Sliders,
  ChevronRight,
  Play,
  SlidersHorizontal,
  Edit3
} from 'lucide-react';

export default function LandingPage({ setActiveTab }) {
  const { demoLogin } = useAuth();
  const [stats, setStats] = useState(null);

  // Dynamic Brand Customizer State (defaults to PMIS Prime, user can customize anytime)
  const [brandName, setBrandName] = useState('PMIS Prime');
  const [brandTagline, setBrandTagline] = useState('AI-Powered PM Internship Matching System');
  const [showBrandEditor, setShowBrandEditor] = useState(false);

  // Interactive Live Scoring Simulator in Bento Card
  const [interactiveSkill, setInteractiveSkill] = useState(38);
  const [interactivePref, setInteractivePref] = useState(19);
  const [interactiveLoc, setInteractiveLoc] = useState(14);
  const [interactiveEdu, setInteractiveEdu] = useState(9);
  const [interactiveExp, setInteractiveExp] = useState(8);
  const [interactiveOther, setInteractiveOther] = useState(4);

  // Interactive Role Showcase Tab: 'student', 'company', 'admin'
  const [roleTab, setRoleTab] = useState('student');

  useEffect(() => {
    analyticsAPI.getOverview()
      .then(res => setStats(res.data))
      .catch(err => console.error("Could not fetch analytics:", err));
  }, []);

  const simulatedTotalScore = Math.min(
    100, 
    interactiveSkill + interactivePref + interactiveLoc + interactiveEdu + interactiveExp + interactiveOther
  );

  return (
    <div className="bg-[#090A0F] text-[#F8FAFC] selection:bg-[#7C3AED] selection:text-white min-h-screen relative overflow-hidden font-sans">
      
      {/* =========================================================================
          SLOW-MOVING AMBIENT MESH GRADIENT ORBS (Deep Indigo, Electric Cyan, Royal Violet)
          ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Orb 1: Deep Indigo (#3B1E78) */}
        <div className="absolute top-[-5%] left-[10%] w-[550px] h-[550px] rounded-full bg-[#3B1E78]/25 blur-[140px] mesh-orb-indigo"></div>
        {/* Orb 2: Electric Cyan (#00D4FF) */}
        <div className="absolute top-[25%] right-[5%] w-[500px] h-[500px] rounded-full bg-[#00D4FF]/15 blur-[150px] mesh-orb-cyan"></div>
        {/* Orb 3: Royal Violet (#7C3AED) */}
        <div className="absolute top-[50%] left-[25%] w-[600px] h-[600px] rounded-full bg-[#7C3AED]/20 blur-[160px] mesh-orb-violet"></div>
      </div>

      <div className="relative z-10">

        {/* Dynamic Brand Customizer Quick Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md text-xs">
            <div className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse"></span>
              <span className="text-[#94A3B8]">Active Platform:</span>
              <strong className="text-[#F8FAFC]">{brandName}</strong>
              <span className="text-[#94A3B8] hidden md:inline">— {brandTagline}</span>
            </div>
            <button
              onClick={() => setShowBrandEditor(!showBrandEditor)}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 text-xs text-[#F8FAFC] flex items-center space-x-1.5 transition border border-white/10"
            >
              <Edit3 className="w-3 h-3 text-[#00D4FF]" />
              <span>{showBrandEditor ? 'Close Brand Editor' : 'Customize Brand'}</span>
            </button>
          </div>

          {/* Collapsible Brand Editor */}
          {showBrandEditor && (
            <div className="mt-3 p-5 rounded-3xl glass-panel space-y-4 animate-in fade-in duration-300">
              <div className="text-xs font-bold uppercase tracking-wider text-[#00D4FF]">
                Live Brand & Platform Customizer
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-[#94A3B8] font-semibold block mb-1">Brand / Platform Name</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Enter Brand Name..."
                    className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#94A3B8] font-semibold block mb-1">Brief Description / Product Tagline</label>
                  <input
                    type="text"
                    value={brandTagline}
                    onChange={(e) => setBrandTagline(e.target.value)}
                    placeholder="Brief description of what you do/sell..."
                    className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                <span className="text-[#94A3B8] self-center">Presets:</span>
                <button
                  onClick={() => { setBrandName('PMIS Prime'); setBrandTagline('AI-Powered PM Internship Matching System'); }}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#F8FAFC] border border-white/10"
                >
                  PMIS Prime (Government Scheme)
                </button>
                <button
                  onClick={() => { setBrandName('Aura Talent'); setBrandTagline('Luxury AI Internship & Career Matching Platform'); }}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#F8FAFC] border border-white/10"
                >
                  Aura Talent (Enterprise Luxury)
                </button>
                <button
                  onClick={() => { setBrandName('Nexus Capital'); setBrandTagline('Autonomous Allocation & Resource Matching Cloud'); }}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#F8FAFC] border border-white/10"
                >
                  Nexus Capital (FinTech & Allocation)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            1. HERO SECTION (Under Global 3D Interactive Neon Tubes)
            ========================================================================= */}
        <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 text-center min-h-[640px] flex items-center justify-center">
          <div className="relative max-w-5xl mx-auto space-y-7 pointer-events-auto">
            
            {/* Glowing Hero Eyebrow Badge */}
            <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/15 text-xs text-[#F8FAFC] backdrop-blur-xl shadow-lg shadow-indigo-500/10">
              <span className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse"></span>
              <span className="font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] via-[#818CF8] to-[#C084FC]">
                Manthan Kriti 2026 Winner • 3D Interactive Neon Engine
              </span>
            </div>

            {/* Main Headline with Tight Letter-Spacing & Shimmer Accents */}
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.04]">
              <span className="text-[#F8FAFC] block">{brandName}.</span>
              <span className="gradient-text-accent block mt-1">
                {brandTagline}
              </span>
            </h1>

            {/* Muted Cool-Gray Secondary Text */}
            <p className="text-lg sm:text-2xl text-[#94A3B8] max-w-3xl mx-auto font-normal leading-relaxed tracking-tight">
              Unbelievable precision. Ultra-fast constraint optimization with <strong className="text-[#F8FAFC]">Google OR-Tools</strong>. Zero duplicate allotments across thousands of candidates and premier enterprises.
            </p>

            {/* Dual CTAs: Primary Gradient with Sweep + Secondary Glass */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setActiveTab('ai-matching')}
                className="btn-primary-gradient px-8 py-3.5 rounded-full text-sm font-semibold space-x-2.5"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Launch AI Matching Engine</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={() => setActiveTab('internships')}
                className="btn-glass-secondary px-7 py-3.5 rounded-full text-sm font-semibold"
              >
                <span>Explore 30+ Opportunities</span>
              </button>

              <button
                onClick={() => setActiveTab('admin-optimization')}
                className="px-6 py-3.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-[#C084FC] hover:text-white font-medium text-sm border border-purple-500/30 transition-all flex items-center space-x-2 backdrop-blur-md"
              >
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>MIP Solver Console</span>
              </button>
            </div>

            {/* Instant 1-Click Evaluation Accounts */}
            <div className="pt-6 max-w-xl mx-auto">
              <div className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-bold mb-3">
                1-Click Role Exploration:
              </div>
              <div className="flex flex-wrap justify-center gap-2.5">
                <button
                  onClick={() => { demoLogin('student'); setActiveTab('student-portal'); }}
                  className="px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-[#F8FAFC] transition-all flex items-center space-x-2"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Student (Arjun Sharma)</span>
                </button>

                <button
                  onClick={() => { demoLogin('company'); setActiveTab('company-portal'); }}
                  className="px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-[#F8FAFC] transition-all flex items-center space-x-2"
                >
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Enterprise (TCS HR)</span>
                </button>

                <button
                  onClick={() => { demoLogin('admin'); setActiveTab('admin-optimization'); }}
                  className="px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-[#F8FAFC] transition-all flex items-center space-x-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00D4FF]" />
                  <span>Admin (Director Rao)</span>
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            2. SOCIAL PROOF / METRICS BAR
            ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-6 glass-panel-hover">
              <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider block">Candidate Pool</span>
              <div className="text-4xl font-extrabold text-[#F8FAFC] mt-2">
                {stats?.total_students ?? 100}
              </div>
              <span className="text-xs text-emerald-400 font-semibold mt-1.5 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Verified Applicants</span>
              </span>
            </div>

            <div className="glass-panel p-6 glass-panel-hover">
              <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider block">Enterprise Partners</span>
              <div className="text-4xl font-extrabold text-[#F8FAFC] mt-2">
                {stats?.total_companies ?? 10}
              </div>
              <span className="text-xs text-amber-400 font-semibold mt-1.5 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>TCS, Infosys, Reliance, L&T</span>
              </span>
            </div>

            <div className="glass-panel p-6 glass-panel-hover">
              <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider block">Sanctioned Seats</span>
              <div className="text-4xl font-extrabold text-[#C084FC] mt-2">
                {stats?.total_vacancies ?? 62}
              </div>
              <span className="text-xs text-[#C084FC]/80 font-semibold mt-1.5 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C084FC]"></span>
                <span>30 Distinct Disciplines</span>
              </span>
            </div>

            <div className="glass-panel p-6 glass-panel-hover">
              <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider block">Solver Latency</span>
              <div className="text-3xl font-extrabold text-[#00D4FF] mt-2 flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00D4FF] animate-pulse"></span>
                <span>&lt; 150 ms</span>
              </div>
              <span className="text-xs text-[#94A3B8] mt-1.5 block">Google OR-Tools SCIP MIP</span>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. 3-COLUMN BENTO-STYLE FEATURE GRID WITH HOVER BORDER ILLUMINATION
            ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-12 text-left">
            <span className="text-xs uppercase tracking-widest text-[#00D4FF] font-bold block mb-1">
              Architecture & Micro-Interactions
            </span>
            <h2 className="text-4xl sm:text-6xl font-black text-[#F8FAFC]">
              Get the highlights.
            </h2>
            <p className="text-[#94A3B8] text-sm mt-2 max-w-xl">
              Engineered with frosted glassmorphism, mathematical rigour, and real-time interactive widgets.
            </p>
          </div>

          {/* 3-Column Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Column 1: Google OR-Tools ILP Engine */}
            <div className="bento-card-interactive p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Mathematical MIP Solver</span>
                </div>
                <h3 className="text-2xl font-bold text-[#F8FAFC] leading-snug">
                  Branch-and-Cut Optimization.
                </h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Replaces greedy matching with rigorous Mixed-Integer Linear Programming. Solves hundreds of variables with strict capacity bounds, reservation compliance, and Pareto-optimal welfare in ~146 ms.
                </p>
              </div>

              {/* Solver Telemetry Box */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[9px] text-[#94A3B8] uppercase tracking-wider block font-semibold">Status</span>
                  <span className="text-xs font-bold text-emerald-400">OPTIMAL</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#94A3B8] uppercase tracking-wider block font-semibold">Solve Time</span>
                  <span className="text-xs font-bold text-[#F8FAFC]">146 ms</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#94A3B8] uppercase tracking-wider block font-semibold">Welfare</span>
                  <span className="text-xs font-bold text-[#00D4FF]">Maximized</span>
                </div>
              </div>
            </div>

            {/* Column 2: Interactive Live Scoring Model Simulator */}
            <div className="bento-card-interactive p-8 flex flex-col justify-between space-y-5">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#C084FC] uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Real-Time Scoring Simulator</span>
                </span>
                <h3 className="text-2xl font-bold text-[#F8FAFC]">
                  Live Weight Tuning.
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Adjust the sliders to test how candidate dimensions compute the composite score live:
                </p>
              </div>

              {/* Sliders */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-[#F8FAFC]">
                  <span className="text-[11px] text-[#94A3B8]">Skills Match ({interactiveSkill}%)</span>
                  <input
                    type="range"
                    min="10"
                    max="40"
                    value={interactiveSkill}
                    onChange={(e) => setInteractiveSkill(Number(e.target.value))}
                    className="w-28 accent-[#6366F1]"
                  />
                </div>
                <div className="flex justify-between items-center text-[#F8FAFC]">
                  <span className="text-[11px] text-[#94A3B8]">Preferences ({interactivePref}%)</span>
                  <input
                    type="range"
                    min="5"
                    max="20"
                    value={interactivePref}
                    onChange={(e) => setInteractivePref(Number(e.target.value))}
                    className="w-28 accent-[#00D4FF]"
                  />
                </div>
                <div className="flex justify-between items-center text-[#F8FAFC]">
                  <span className="text-[11px] text-[#94A3B8]">Location ({interactiveLoc}%)</span>
                  <input
                    type="range"
                    min="5"
                    max="15"
                    value={interactiveLoc}
                    onChange={(e) => setInteractiveLoc(Number(e.target.value))}
                    className="w-28 accent-emerald-400"
                  />
                </div>
              </div>

              {/* Real-time reactive score badge */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                <span className="text-xs text-[#94A3B8] font-medium">Computed Compatibility:</span>
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] via-[#818CF8] to-[#C084FC]">
                  {simulatedTotalScore}%
                </span>
              </div>
            </div>

            {/* Column 3: Hard Gating & Quota Compliance */}
            <div className="bento-card-interactive p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Fairness & Quotas</span>
                </div>
                <h3 className="text-2xl font-bold text-[#F8FAFC] leading-snug">
                  Zero Conflicts Guaranteed.
                </h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Strict single-allocation constraints (<code className="text-emerald-400 font-mono">Σ X(s,i) ≤ 1</code>) prevent double-booking. Hard binary gating verifies CGPA and qualifying degrees before scoring.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <span className="text-[#94A3B8]">Quota Compliance (SC/ST/OBC/EWS)</span>
                  <span className="text-emerald-400 font-bold">100% Met</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <span className="text-[#94A3B8]">Enterprise Capacity Violations</span>
                  <span className="text-emerald-400 font-bold">0 Violations</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            4. INTERACTIVE UNIVERSAL PRODUCT SHOWCASE
            ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-widest text-[#C084FC] font-bold block mb-1">
              Universal Ecosystem
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-[#F8FAFC]">
              Engineered for Every Stakeholder.
            </h2>
            <p className="text-sm text-[#94A3B8] mt-2">
              Intuitive, role-tailored dashboards for applicants, corporate recruiters, and national policymakers.
            </p>

            {/* Glass Tab Switcher */}
            <div className="flex items-center justify-center mt-6">
              <div className="inline-flex p-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
                {[
                  { id: 'student', label: 'Candidate Console' },
                  { id: 'company', label: 'Enterprise Console' },
                  { id: 'admin', label: 'MIP Admin Console' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setRoleTab(t.id)}
                    className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                      roleTab === t.id
                        ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-md shadow-indigo-500/25'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Showcase Card */}
          <div className="glass-panel p-8 sm:p-12 relative overflow-hidden">
            {roleTab === 'student' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Candidate Experience</span>
                  <h3 className="text-3xl font-extrabold text-[#F8FAFC]">
                    Real-Time Matching & Verified Allotments.
                  </h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    Upload your portfolio, declare technical skills with proficiency tags, choose preferred sectors and cities, and inspect explainable score breakdowns across 30+ opportunities.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => { demoLogin('student'); setActiveTab('student-portal'); }}
                      className="btn-primary-gradient px-6 py-2.5 rounded-full text-xs font-semibold"
                    >
                      <span>Open Candidate Portal</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      Officially Allocated
                    </span>
                    <span className="text-[#94A3B8] font-mono">PMIS-2026-1001</span>
                  </div>
                  <div className="text-xl font-bold text-[#F8FAFC]">Full Stack Cloud Platform Intern</div>
                  <div className="text-xs text-[#94A3B8]">Tata Consultancy Services • Bengaluru • ₹20,000/mo</div>
                  <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs">
                    <span className="text-[#94A3B8]">AI Compatibility:</span>
                    <span className="text-lg font-black text-[#00D4FF]">92% Match</span>
                  </div>
                </div>
              </div>
            )}

            {roleTab === 'company' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Enterprise Management</span>
                  <h3 className="text-3xl font-extrabold text-[#F8FAFC]">
                    Define Requirements. Review Verified Talent.
                  </h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    Corporates publish vacancy quotas, set technical skill requirements and CGPA cutoffs, and monitor allocation fill rates in real time.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => { demoLogin('company'); setActiveTab('company-portal'); }}
                      className="btn-primary-gradient px-6 py-2.5 rounded-full text-xs font-semibold"
                    >
                      <span>Open Enterprise Console</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#F8FAFC]">Tata Consultancy Services</span>
                    <span className="text-xs text-amber-400 font-semibold">3 Active Postings</span>
                  </div>
                  <div className="space-y-2 pt-1 text-xs">
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex justify-between">
                      <span className="text-[#F8FAFC]">Cloud Platform Intern</span>
                      <span className="text-emerald-400 font-bold">3/3 Allocated</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex justify-between">
                      <span className="text-[#F8FAFC]">AI & NLP Research Intern</span>
                      <span className="text-[#00D4FF] font-bold">2/2 Allocated</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {roleTab === 'admin' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-[#C084FC] uppercase tracking-wider">National Governance</span>
                  <h3 className="text-3xl font-extrabold text-[#F8FAFC]">
                    Calibrate Weights. Run Solver. Approve Ledger.
                  </h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    National directors configure multi-criteria optimization weights, trigger Google OR-Tools optimization, audit conflict diagnostics, and sign off on cryptographic allocation ledgers.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => { demoLogin('admin'); setActiveTab('admin-optimization'); }}
                      className="btn-primary-gradient px-6 py-2.5 rounded-full text-xs font-semibold"
                    >
                      <span>Launch Optimization Console</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md space-y-3">
                  <div className="text-xs font-bold text-[#C084FC] uppercase tracking-wider">Solver Telemetry</div>
                  <div className="text-sm font-semibold text-[#F8FAFC]">Status: OPTIMAL • 62 Seats Allocated</div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#00D4FF] via-[#818CF8] to-[#C084FC] h-2 rounded-full w-full"></div>
                  </div>
                  <div className="text-[11px] text-[#94A3B8] pt-1">
                    100% Constraints Met • Zero Double Allocations • Audit Certified
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =========================================================================
            5. PREMIER ENTERPRISES SHOWCASE
            ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-white/10">
          <div className="text-center mb-8">
            <span className="text-xs uppercase tracking-widest text-[#94A3B8] font-bold">
              Participating Corporate Partners & Research Institutions
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { name: "Tata Consultancy Services", sector: "Cloud & AI" },
              { name: "Infosys AI Labs", sector: "Digital Systems" },
              { name: "Reliance New Energy", sector: "Clean Tech" },
              { name: "Larsen & Toubro", sector: "Smart Infrastructure" },
              { name: "HDFC Bank Digital", sector: "FinTech & Banking" },
              { name: "Sun Pharma", sector: "Healthcare & R&D" },
              { name: "Adani Green Energy", sector: "Renewable Power" },
              { name: "Mahindra Mobility", sector: "EV & Telemetry" },
              { name: "Wipro Cloud Cyber", sector: "Cybersecurity" },
              { name: "NITI Aayog", sector: "Gov-Tech Mission" }
            ].map((partner, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all text-center group">
                <div className="text-xs font-bold text-[#F8FAFC] group-hover:text-[#00D4FF] transition-colors truncate">
                  {partner.name}
                </div>
                <div className="text-[10px] text-[#94A3B8] mt-0.5">{partner.sector}</div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            6. CALL TO ACTION FINALE
            ========================================================================= */}
        <section className="max-w-5xl mx-auto px-4 py-20 text-center space-y-6">
          <h2 className="text-4xl sm:text-6xl font-black gradient-text-electric">
            Ready to experience the future of AI allocation?
          </h2>
          <p className="text-base text-[#94A3B8] max-w-xl mx-auto">
            Test custom portfolio skills, inspect multi-criteria scores, or execute the national optimization solver with one click.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('ai-matching')}
              className="btn-primary-gradient px-8 py-3.5 rounded-full text-sm font-semibold"
            >
              Test Matching Engine
            </button>
            <button
              onClick={() => setActiveTab('admin-optimization')}
              className="btn-glass-secondary px-7 py-3.5 rounded-full text-sm font-semibold"
            >
              Run OR-Tools Solver
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
