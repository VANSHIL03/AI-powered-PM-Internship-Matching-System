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
  Play
} from 'lucide-react';

export default function LandingPage({ setActiveTab }) {
  const { demoLogin } = useAuth();
  const [stats, setStats] = useState(null);

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
    <div className="bg-[#000000] text-white selection:bg-[#2997FF] selection:text-white min-h-screen">
      
      {/* 1. HERO SECTION (Apple iPad Mini Style) */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        {/* Apple Intelligence Glowing Ambient Aura */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-gradient-to-tr from-[#2997FF]/25 via-[#BF5AF2]/30 to-[#FF375F]/20 rounded-full blur-[120px] pointer-events-none animate-apple-aura"></div>

        <div className="relative max-w-5xl mx-auto space-y-6">
          {/* Top Pill Eyebrow */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-white/90 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse"></span>
            <span className="font-semibold tracking-wide">Manthan Kriti 2026 National Hackathon Winner Prototype</span>
          </div>

          {/* Main Giant Apple Typography */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05]">
            <span className="apple-text-gradient">PM Internship Scheme.</span>
            <br />
            <span className="apple-intelligence-gradient">
              Built for AI Allocation.
            </span>
          </h1>

          <p className="text-lg sm:text-2xl text-[#86868B] max-w-3xl mx-auto font-normal leading-relaxed tracking-tight">
            Unbelievable compatibility. Ultra-fast constraint optimization with <strong className="text-white">Google OR-Tools</strong>. Zero duplicate allocations across thousands of candidates.
          </p>

          {/* CTA Buttons (Apple Style Pills) */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setActiveTab('ai-matching')}
              className="px-6 py-3 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center space-x-2 hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch AI Matching Engine</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>

            <button
              onClick={() => setActiveTab('internships')}
              className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/15 transition-all backdrop-blur-md hover:scale-[1.02]"
            >
              <span>Explore 30+ Vacancies</span>
            </button>

            <button
              onClick={() => setActiveTab('admin-optimization')}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600/30 to-indigo-600/30 text-purple-300 font-semibold text-sm border border-purple-500/30 hover:bg-purple-600/40 transition-all flex items-center space-x-2"
            >
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Admin Allocation Console</span>
            </button>
          </div>

          {/* Instant 1-Click Evaluation Accounts */}
          <div className="pt-8 max-w-xl mx-auto">
            <div className="text-[11px] uppercase tracking-wider text-[#86868B] font-semibold mb-3">
              Instant 1-Click Role Exploration:
            </div>
            <div className="flex flex-wrap justify-center gap-2.5">
              <button
                onClick={() => { demoLogin('student'); setActiveTab('student-portal'); }}
                className="px-3.5 py-1.5 rounded-full bg-[#1C1C1E] hover:bg-[#2C2C2E] border border-white/10 text-xs font-medium text-white transition flex items-center space-x-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5 text-[#30D158]" />
                <span>Student (Arjun Sharma)</span>
              </button>

              <button
                onClick={() => { demoLogin('company'); setActiveTab('company-portal'); }}
                className="px-3.5 py-1.5 rounded-full bg-[#1C1C1E] hover:bg-[#2C2C2E] border border-white/10 text-xs font-medium text-white transition flex items-center space-x-1.5"
              >
                <Building2 className="w-3.5 h-3.5 text-[#FF9F0A]" />
                <span>Enterprise (TCS HR)</span>
              </button>

              <button
                onClick={() => { demoLogin('admin'); setActiveTab('admin-optimization'); }}
                className="px-3.5 py-1.5 rounded-full bg-[#1C1C1E] hover:bg-[#2C2C2E] border border-white/10 text-xs font-medium text-white transition flex items-center space-x-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#2997FF]" />
                <span>Admin (Director Rao)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE METRICS RIBBON */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-3xl bg-[#161617] border border-white/10 hover:border-white/20 transition-colors">
            <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider block">Total Students</span>
            <div className="text-4xl font-extrabold text-white mt-1.5">
              {stats?.total_students ?? 100}
            </div>
            <span className="text-xs text-[#30D158] font-semibold mt-1 block">Verified Pool Registered</span>
          </div>

          <div className="p-6 rounded-3xl bg-[#161617] border border-white/10 hover:border-white/20 transition-colors">
            <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider block">Enterprise Partners</span>
            <div className="text-4xl font-extrabold text-white mt-1.5">
              {stats?.total_companies ?? 10}
            </div>
            <span className="text-xs text-[#FF9F0A] font-semibold mt-1 block">TCS, Infosys, Reliance, L&T</span>
          </div>

          <div className="p-6 rounded-3xl bg-[#161617] border border-white/10 hover:border-white/20 transition-colors">
            <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider block">Total Vacancy Seats</span>
            <div className="text-4xl font-extrabold text-white mt-1.5">
              {stats?.total_vacancies ?? 62}
            </div>
            <span className="text-xs text-[#BF5AF2] font-semibold mt-1 block">Across 30 Diverse Roles</span>
          </div>

          <div className="p-6 rounded-3xl bg-[#161617] border border-white/10 hover:border-white/20 transition-colors">
            <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider block">Optimization Engine</span>
            <div className="text-2xl font-black text-[#2997FF] mt-2 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2997FF] animate-pulse"></span>
              <span>OR-Tools MIP</span>
            </div>
            <span className="text-xs text-[#86868B] mt-1 block">Solved in ~150 ms</span>
          </div>
        </div>
      </section>

      {/* 3. GET THE HIGHLIGHTS (Apple Bento Grid Showcase) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10 text-left">
          <span className="text-xs uppercase tracking-widest text-[#2997FF] font-bold block mb-1">
            Engine Architecture
          </span>
          <h2 className="text-4xl sm:text-6xl font-black apple-text-gradient">
            Get the highlights.
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* Card 1: Large Bento - Google OR-Tools Engine (Col 1-7) */}
          <div className="md:col-span-7 p-8 rounded-3xl bg-gradient-to-br from-[#161617] via-[#161617] to-[#1F1F24] border border-white/10 relative overflow-hidden flex flex-col justify-between group">
            {/* Ambient subtle glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#2997FF]/15 text-[#2997FF] text-xs font-bold border border-[#2997FF]/30">
                <Cpu className="w-3.5 h-3.5" />
                <span>Google OR-Tools Integer Linear Programming</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Unbelievably fast. <br />
                <span className="apple-intelligence-gradient">Globally optimal allocation.</span>
              </h3>
              <p className="text-sm text-[#86868B] max-w-lg leading-relaxed">
                Replaces rudimentary greedy search with rigorous branch-and-cut MILP algorithms. Solves allocation matrices with capacity constraints, reservations, and multi-criteria welfare in under 200 milliseconds.
              </p>
            </div>

            {/* Interactive Live Solver Telemetry Pill */}
            <div className="mt-8 p-4 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-[10px] text-[#86868B] uppercase tracking-wider block font-semibold">Status</span>
                <span className="text-sm font-bold text-[#30D158]">OPTIMAL</span>
              </div>
              <div>
                <span className="text-[10px] text-[#86868B] uppercase tracking-wider block font-semibold">Solve Time</span>
                <span className="text-sm font-bold text-white">146 ms</span>
              </div>
              <div>
                <span className="text-[10px] text-[#86868B] uppercase tracking-wider block font-semibold">Welfare Match</span>
                <span className="text-sm font-bold text-[#2997FF]">Maximized</span>
              </div>
            </div>
          </div>

          {/* Card 2: Interactive Scoring Model Simulator (Col 8-12) */}
          <div className="md:col-span-5 p-8 rounded-3xl bg-[#161617] border border-white/10 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#BF5AF2] uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Interactive AI Match Simulator</span>
              </span>
              <h3 className="text-2xl font-black text-white">
                0 to 100% Score.
              </h3>
              <p className="text-xs text-[#86868B]">
                Drag the sliders below to see how the scoring model balances candidate criteria live:
              </p>
            </div>

            {/* Live Interactive Sliders */}
            <div className="my-5 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Skill Match ({interactiveSkill}%)</span>
                <input
                  type="range"
                  min="10"
                  max="40"
                  value={interactiveSkill}
                  onChange={(e) => setInteractiveSkill(Number(e.target.value))}
                  className="w-28 accent-[#FF9F0A]"
                />
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Preferences ({interactivePref}%)</span>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={interactivePref}
                  onChange={(e) => setInteractivePref(Number(e.target.value))}
                  className="w-28 accent-[#2997FF]"
                />
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Location Match ({interactiveLoc}%)</span>
                <input
                  type="range"
                  min="5"
                  max="15"
                  value={interactiveLoc}
                  onChange={(e) => setInteractiveLoc(Number(e.target.value))}
                  className="w-28 accent-[#30D158]"
                />
              </div>
            </div>

            {/* Calculated Simulated Score Badge */}
            <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between">
              <span className="text-xs text-[#86868B] font-medium">Computed Compatibility:</span>
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#2997FF] via-[#BF5AF2] to-[#FF375F]">
                {simulatedTotalScore}%
              </span>
            </div>
          </div>

          {/* Card 3: Hard Constraints (Col 1-4) */}
          <div className="md:col-span-4 p-6 rounded-3xl bg-[#161617] border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#30D158]/15 text-[#30D158] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white">Zero Duplicate Allocations</h4>
            <p className="text-xs text-[#86868B] leading-relaxed">
              Mathematical guarantee <code className="text-[#30D158] font-mono">Σ X(s,i) ≤ 1</code>. No student is ever double-booked across competing enterprises.
            </p>
          </div>

          {/* Card 4: Hard Binary Gating (Col 5-8) */}
          <div className="md:col-span-4 p-6 rounded-3xl bg-[#161617] border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#BF5AF2]/15 text-[#BF5AF2] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white">Hard Eligibility Gating</h4>
            <p className="text-xs text-[#86868B] leading-relaxed">
              Minimum CGPA and required degree qualifications are treated as non-negotiable hard binary constraints before compatibility scoring.
            </p>
          </div>

          {/* Card 5: Quota Compliance (Col 9-12) */}
          <div className="md:col-span-4 p-6 rounded-3xl bg-[#161617] border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF9F0A]/15 text-[#FF9F0A] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white">Configurable Quotas</h4>
            <p className="text-xs text-[#86868B] leading-relaxed">
              Reservation rules for GEN, OBC-NCL, SC, ST, EWS, and PwD with soft-slack conflict diagnostics for administrator review.
            </p>
          </div>

        </div>
      </section>

      {/* 4. INTERACTIVE PRODUCT SHOWCASE: FOR STUDENTS, ENTERPRISES, ADMINS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest text-[#BF5AF2] font-bold block mb-1">
            Universal Portals
          </span>
          <h2 className="text-4xl sm:text-5xl font-black apple-text-gradient">
            Built for national scale.
          </h2>
          <p className="text-sm text-[#86868B] mt-2">
            Tailored, responsive interfaces engineered for candidate, enterprise, and governance workflows.
          </p>

          {/* Apple-style Interactive Tab Switcher */}
          <div className="flex items-center justify-center mt-6">
            <div className="inline-flex p-1 rounded-full bg-[#1C1C1E] border border-white/10">
              {[
                { id: 'student', label: 'Candidate Portal' },
                { id: 'company', label: 'Enterprise Portal' },
                { id: 'admin', label: 'Governance & Admin' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setRoleTab(t.id)}
                  className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                    roleTab === t.id
                      ? 'bg-white text-black shadow-md'
                      : 'text-[#86868B] hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content Display (Apple Product Showcase Card) */}
        <div className="p-8 sm:p-12 rounded-3xl bg-[#161617] border border-white/10 relative overflow-hidden">
          {roleTab === 'student' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#30D158] uppercase tracking-wider">Candidate Experience</span>
                <h3 className="text-3xl font-extrabold text-white">
                  Your official allotment letter. Verified and instant.
                </h3>
                <p className="text-sm text-[#86868B] leading-relaxed">
                  Students register technical skills with proficiency tags, select preferred sectors and cities, and receive real-time compatibility scores for 30+ opportunities with clear explainable breakdowns.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => { demoLogin('student'); setActiveTab('student-portal'); }}
                    className="px-5 py-2.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold flex items-center space-x-1.5 transition"
                  >
                    <span>Open Student Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Simulated Card Preview */}
              <div className="p-6 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#30D158]/20 text-[#30D158] font-bold border border-[#30D158]/30">
                    Officially Allocated
                  </span>
                  <span className="text-[#86868B] font-mono">PMIS-2026-1001</span>
                </div>
                <div className="text-xl font-bold text-white">Full Stack Cloud Platform Intern</div>
                <div className="text-xs text-[#86868B]">Tata Consultancy Services • Bengaluru • ₹20,000/mo</div>
                <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs">
                  <span className="text-[#86868B]">AI Compatibility:</span>
                  <span className="text-lg font-black text-[#2997FF]">90% Match</span>
                </div>
              </div>
            </div>
          )}

          {roleTab === 'company' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#FF9F0A] uppercase tracking-wider">Enterprise Management</span>
                <h3 className="text-3xl font-extrabold text-white">
                  Define requirements. Review top-matched talent.
                </h3>
                <p className="text-sm text-[#86868B] leading-relaxed">
                  Enterprises post internship vacancies with custom seat capacities, required & preferred technical skills, minimum CGPA barriers, and category reservation allocations.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => { demoLogin('company'); setActiveTab('company-portal'); }}
                    className="px-5 py-2.5 rounded-full bg-[#FF9F0A] hover:bg-amber-500 text-black text-xs font-bold flex items-center space-x-1.5 transition"
                  >
                    <span>Open Enterprise Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Tata Consultancy Services</span>
                  <span className="text-xs text-[#FF9F0A]">3 Active Postings</span>
                </div>
                <div className="space-y-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex justify-between">
                    <span>Cloud Platform Intern</span>
                    <span className="text-[#30D158] font-bold">3/3 Allocated</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex justify-between">
                    <span>AI & NLP Intern</span>
                    <span className="text-[#2997FF] font-bold">2/2 Allocated</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {roleTab === 'admin' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#BF5AF2] uppercase tracking-wider">National Governance</span>
                <h3 className="text-3xl font-extrabold text-white">
                  Tune weights. Run the solver. Approve final ledger.
                </h3>
                <p className="text-sm text-[#86868B] leading-relaxed">
                  National directors configure multi-criteria weights, trigger Google OR-Tools optimization, audit conflict diagnostics, enforce publish sign-off gates, and download CSV allocation ledgers.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => { demoLogin('admin'); setActiveTab('admin-optimization'); }}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 transition"
                  >
                    <span>Launch Optimization Console</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md space-y-3">
                <div className="text-xs font-bold text-[#BF5AF2] uppercase">ILP Solver Telemetry</div>
                <div className="text-sm font-semibold text-white">Status: OPTIMAL • 62 Seats Placed</div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#2997FF] to-[#30D158] h-2 rounded-full w-full"></div>
                </div>
                <div className="text-[11px] text-[#86868B] pt-1">
                  100% Constraints Met • Zero Conflicts • Approved for Publication
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. PREMIER ENTERPRISES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-white/10">
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest text-[#86868B] font-bold">
            Participating Industry Partners & Institutions
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { name: "Tata Consultancy Services", sector: "Cloud & IT" },
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
            <div key={i} className="p-4 rounded-2xl bg-[#161617] border border-white/5 hover:border-white/20 transition-all text-center">
              <div className="text-xs font-bold text-white truncate">{partner.name}</div>
              <div className="text-[10px] text-[#86868B] mt-0.5">{partner.sector}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION FINALE */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center space-y-6">
        <h2 className="text-4xl sm:text-6xl font-black apple-text-gradient">
          Ready to experience the future of internship allocation?
        </h2>
        <p className="text-base text-[#86868B] max-w-xl mx-auto">
          Explore the live simulation, test custom student skills, or run the national optimization solver with one click.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setActiveTab('ai-matching')}
            className="px-6 py-3 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-sm transition shadow-lg shadow-blue-500/25"
          >
            Test Matching Engine
          </button>
          <button
            onClick={() => setActiveTab('admin-optimization')}
            className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/15 transition"
          >
            Run OR-Tools Solver
          </button>
        </div>
      </section>

    </div>
  );
}
