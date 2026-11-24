import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#000000] text-[#86868B] border-t border-white/10 text-xs">
      {/* Disclaimer Strip */}
      <div className="bg-[#121214] border-b border-white/5 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-start space-x-2 text-[#A1A1A6] text-[11px] leading-relaxed">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#2997FF]" />
          <span>
            <strong>Illustrative Demonstration Notice:</strong> Sample reservation categories, quotas, and optimization parameters implemented in this prototype are engineered for technical demonstration in <strong>Manthan Kriti 2026</strong>. They reflect constraint-aware mathematical modeling and do not constitute official Government of India scheme policy.
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-white font-bold text-sm">
              <div className="w-6 h-6 rounded bg-gradient-to-tr from-[#2997FF] via-[#BF5AF2] to-[#FF375F] flex items-center justify-center text-xs font-black">
                PM
              </div>
              <span>PM Internship Scheme (PMIS)</span>
            </div>
            <p className="text-[#86868B] text-xs leading-relaxed">
              An intelligent, constraint-aware AI internship allocation platform ensuring fair, transparent, and merit-compatible opportunities across India.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">Core Pillars</h4>
            <ul className="space-y-1.5 text-[#86868B] text-xs">
              <li>• Multi-Criteria Compatibility Engine (0–100)</li>
              <li>• Python Google OR-Tools Optimization</li>
              <li>• Mixed Integer Linear Programming (MIP/SCIP)</li>
              <li>• Role-Based Access Control (RBAC)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">Hackathon Context</h4>
            <ul className="space-y-1.5 text-[#86868B] text-xs">
              <li><strong>Event:</strong> Manthan Kriti 2026</li>
              <li><strong>Domain:</strong> Large-Scale Resource Allocation</li>
              <li><strong>Solver:</strong> Google OR-Tools MILP Engine</li>
              <li><strong>Architecture:</strong> FastAPI + React 19 + Tailwind v4</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">Platform Guarantee</h4>
            <div className="space-y-2 text-xs text-[#86868B]">
              <div className="flex items-center space-x-1.5 text-[#30D158]">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Duplicate Allocation Guarantee</span>
              </div>
              <p className="text-[11px] text-[#86868B]">
                Strict capacity bounds, explainable matching breakdowns, and mandatory admin approval before publishing results.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[#86868B] text-[11px]">
          <div>
            © 2026 AI-Powered PM Internship Matching System • Manthan Kriti 2026
          </div>
          <div className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span>Built with</span>
            <span className="text-white font-semibold">Precision Optimization & AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
