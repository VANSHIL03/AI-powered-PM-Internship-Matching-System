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
  FileCheck2, 
  Users, 
  Layers, 
  BarChart3,
  Award,
  Lock,
  ChevronRight
} from 'lucide-react';

export default function LandingPage({ setActiveTab }) {
  const { demoLogin, user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    analyticsAPI.getOverview()
      .then(res => setStats(res.data))
      .catch(err => console.error("Could not fetch analytics:", err));
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0F2A4A] via-[#0B1E36] to-[#081628] text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="relative max-w-7xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Manthan Kriti 2026 National Hackathon Winner Prototype</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto text-white leading-tight">
            AI-Powered PM Internship <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-400">
              Matching & Allocation System
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            An intelligent, constraint-aware platform that optimizes large-scale candidate placement across India’s premier enterprises, maximizing compatibility while rigorously enforcing capacity and eligibility constraints.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <button
              onClick={() => setActiveTab('ai-matching')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/40 hover:from-emerald-500 hover:to-emerald-400 transition flex items-center space-x-2"
            >
              <Cpu className="w-4 h-4" />
              <span>Launch AI Matching Engine</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => setActiveTab('internships')}
              className="px-6 py-3 rounded-xl bg-white/10 text-white font-semibold text-sm border border-white/20 hover:bg-white/15 transition flex items-center space-x-2 backdrop-blur-xs"
            >
              <span>Explore 30+ Vacancies</span>
            </button>

            <button
              onClick={() => setActiveTab('admin-optimization')}
              className="px-6 py-3 rounded-xl bg-amber-500/20 text-amber-300 font-semibold text-sm border border-amber-500/40 hover:bg-amber-500/30 transition flex items-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Admin Allocation Console</span>
            </button>
          </div>

          {/* Quick Demo Launch Pills */}
          <div className="pt-6 border-t border-slate-800/80 max-w-2xl mx-auto">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2.5">
              Instant 1-Click Evaluation Accounts
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => { demoLogin('student'); setActiveTab('student-portal'); }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-emerald-900/60 text-slate-200 hover:text-white border border-slate-700 hover:border-emerald-500 text-xs font-medium transition flex items-center space-x-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Test as Student (Arjun Sharma)</span>
              </button>

              <button
                onClick={() => { demoLogin('company'); setActiveTab('company-portal'); }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-amber-900/60 text-slate-200 hover:text-white border border-slate-700 hover:border-amber-500 text-xs font-medium transition flex items-center space-x-1.5"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Test as Company (TCS HR)</span>
              </button>

              <button
                onClick={() => { demoLogin('admin'); setActiveTab('admin-optimization'); }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-blue-900/60 text-slate-200 hover:text-white border border-slate-700 hover:border-blue-500 text-xs font-medium transition flex items-center space-x-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Test as Admin (Dr. Rao)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Live Metric Summary Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Students Registered</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">
              {stats?.total_students ?? 100}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              100 Verified Candidate Profiles
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Partner Companies</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">
              {stats?.total_companies ?? 10}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              TCS, Infosys, Reliance, L&T, etc.
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Internship Vacancies</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">
              {stats?.total_vacancies ?? 62} Seats
            </div>
            <div className="text-[11px] text-purple-700 font-semibold mt-0.5">
              Across 30 Diverse Roles
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Solver Status</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-700 flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>OR-Tools MIP</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              Integer Linear Programming Ready
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Allocation Architecture */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#107E54] uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            How The Matching Engine Works
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3">
            Constraint-Aware 4-Step Allocation Pipeline
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Moving beyond simple heuristic sort to mathematically guaranteed global welfare maximization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 relative shadow-xs hover:border-blue-400 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center text-sm mb-4">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Student Profiling</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standardized extraction of verified qualifications, skills with proficiency levels, location flexibility, degree eligibility, and category.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 relative shadow-xs hover:border-emerald-400 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-black flex items-center justify-center text-sm mb-4">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Multi-Criteria Scoring</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Computes 0-100 compatibility matrix across Skills (40%), Preferences (20%), Location (15%), Education (10%), Experience (10%), and Other (5%).
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 relative shadow-xs hover:border-purple-400 transition">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-black flex items-center justify-center text-sm mb-4">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Google OR-Tools ILP</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Integer Linear Programming solves the global assignment problem: maximizing compatibility while strictly enforcing capacity and quotas.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 relative shadow-xs hover:border-amber-400 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 font-black flex items-center justify-center text-sm mb-4">
              04
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Admin Audit & Publish</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Infeasibility diagnostics generated for administrative review. After official authorization, allocation letters are published instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Pillars Grid */}
      <section className="bg-slate-50 py-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Zero Duplicate Allocations</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mathematical constraint <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">Σ X(s,i) ≤ 1</code> guarantees no candidate is allocated more than one seat across all companies.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Hard Constraint Gating</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mandatory criteria (minimum CGPA, degree eligibility, active student status) are enforced as non-negotiable hard constraints before scoring.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Full Explainability Audit</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every match score is fully deconstructed into point contributions, matched skills, missing prerequisites, and downloadable CSV ledgers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Participating Enterprise Partners */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Premier Participating Enterprises & Institutions
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { name: "Tata Consultancy Services", sector: "IT & Cloud" },
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
            <div key={i} className="p-3.5 rounded-xl border border-slate-200 bg-white text-center hover:border-slate-300 transition">
              <div className="text-xs font-bold text-slate-900 truncate">{partner.name}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{partner.sector}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
