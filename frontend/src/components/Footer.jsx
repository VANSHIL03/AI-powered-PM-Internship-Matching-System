import React from 'react';
import { ShieldCheck, Info, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0B1E36] text-slate-300 mt-auto border-t border-slate-800 text-xs">
      {/* Disclaimer Strip */}
      <div className="bg-[#081628] border-b border-slate-800 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-start space-x-2 text-amber-300/90 text-[11px] leading-relaxed">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <span>
            <strong>Illustrative Demonstration Notice:</strong> Sample reservation categories, quotas, and optimization parameters implemented in this prototype are designed for technical demonstration in <strong>Manthan Kriti 2026 Hackathon</strong>. They reflect constraint-aware mathematical modeling and do not constitute official Government of India policy.
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-white font-bold text-sm">
              <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center text-xs font-black">
                PM
              </div>
              <span>PM Internship Scheme (PMIS)</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              An intelligent, constraint-aware AI internship allocation platform ensuring fair, transparent, and merit-compatible opportunities across India.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Core Pillars</h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li>• Multi-Criteria Compatibility Engine (60-100)</li>
              <li>• Python Google OR-Tools Optimization</li>
              <li>• Integer Linear Programming (MIP/SCIP)</li>
              <li>• Role-Based Access Control (RBAC)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Hackathon Context</h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li><strong>Event:</strong> Manthan Kriti 2026</li>
              <li><strong>Domain:</strong> Large-Scale Resource Allocation</li>
              <li><strong>Solver:</strong> Google OR-Tools Linear Solver</li>
              <li><strong>Architecture:</strong> FastAPI + React + Tailwind</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Platform Integrity</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Duplicate Allocation Guarantee</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Strict capacity caps, explainable matching breakdowns, and mandatory admin approval before publishing results.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-[11px]">
          <div>
            © 2026 AI-Powered PM Internship Matching System • Manthan Kriti 2026
          </div>
          <div className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span>Built for India's Future with</span>
            <span className="text-emerald-400 font-semibold">Precision Optimization & AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
