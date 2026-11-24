import React from 'react';
import { ShieldCheck, Info, Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#090A0F] text-[#94A3B8] border-t border-white/10 text-xs font-sans relative overflow-hidden">
      {/* Subtle bottom ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[150px] bg-gradient-to-t from-[#3B1E78]/20 via-[#7C3AED]/10 to-transparent blur-[80px] pointer-events-none"></div>

      {/* Official Disclaimer Strip */}
      <div className="bg-[#0D0E15] border-b border-white/5 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-start space-x-2.5 text-[#94A3B8] text-[11px] leading-relaxed">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#00D4FF]" />
          <span>
            <strong className="text-[#F8FAFC]">Demonstration Notice:</strong> Quotas, reservation weights, and simulated allocations shown in this application are built for technical evaluation in the <strong>Manthan Kriti 2026 National Hackathon</strong>, showcasing high-dimensional constraint optimization.
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3.5">
            <div className="flex items-center space-x-2.5 text-[#F8FAFC] font-bold text-sm">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#6366F1] via-[#7C3AED] to-[#00D4FF] flex items-center justify-center text-xs font-black text-white shadow-md shadow-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="tracking-tight text-base">PMIS Prime</span>
            </div>
            <p className="text-[#94A3B8] text-xs leading-relaxed">
              Ultra-high dimensional AI allocation platform delivering fair, merit-aligned, and quota-compliant opportunities across India.
            </p>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>All OR-Tools MIP Solvers Operational</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC] mb-3.5">Algorithmic Pillars</h4>
            <ul className="space-y-2 text-[#94A3B8] text-xs">
              <li className="hover:text-[#F8FAFC] transition">• 6-Dimension Vector Scoring (0–100%)</li>
              <li className="hover:text-[#F8FAFC] transition">• Python Google OR-Tools MIP Engine</li>
              <li className="hover:text-[#F8FAFC] transition">• Hard Constraint Gating (Degree & CGPA)</li>
              <li className="hover:text-[#F8FAFC] transition">• Conflict Diagnostics & Soft Relaxation</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC] mb-3.5">National Hackathon</h4>
            <ul className="space-y-2 text-[#94A3B8] text-xs">
              <li><strong className="text-[#F8FAFC]">Challenge:</strong> Manthan Kriti 2026</li>
              <li><strong className="text-[#F8FAFC]">Domain:</strong> AI-Powered Large-Scale Allocation</li>
              <li><strong className="text-[#F8FAFC]">Stack:</strong> FastAPI + React 19 + SCIP MIP</li>
              <li><strong className="text-[#F8FAFC]">Scalability:</strong> 100k+ Decision Variables</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC] mb-3.5">System Guarantee</h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Duplicate Allotment Guarantee</span>
              </div>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                Strict capacity limits, explainable matching breakdowns, and mandatory admin approval before publishing results.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[#94A3B8] text-[11px] gap-2">
          <div>
            © 2026 PMIS Prime • AI-Powered PM Internship Matching System • Manthan Kriti
          </div>
          <div className="flex items-center space-x-1">
            <span>Engineered with</span>
            <span className="text-[#F8FAFC] font-semibold">Ultra-Premium Glassmorphism & AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
