import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  Cpu, 
  BarChart3, 
  Search, 
  LogOut, 
  LogIn, 
  Sparkles,
  ChevronRight,
  Zap,
  Layers
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, isAuthenticated, logout, demoLogin } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full font-sans">
      {/* Top Announcement Ribbon with Ambient Gradient */}
      <div className="bg-[#090A0F]/90 border-b border-white/10 py-1.5 px-4 text-center text-[11px] text-[#94A3B8] font-medium tracking-tight backdrop-blur-md">
        <span>Manthan Kriti 2026 &nbsp;|&nbsp; </span>
        <span className="text-[#F8FAFC] font-semibold">Prime Minister's Internship Matching Scheme</span>
        <span className="text-white/30 mx-2">•</span>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] via-[#818CF8] to-[#C084FC] font-bold">
          High-Dimensional Optimization Engine
        </span>
      </div>

      {/* Main Frosted Glass Navbar */}
      <nav className="glass-nav transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo & Name */}
            <div 
              onClick={() => setActiveTab('home')}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6366F1] via-[#7C3AED] to-[#00D4FF] flex items-center justify-center text-white text-xs font-black shadow-lg shadow-indigo-500/25 group-hover:scale-105 group-hover:shadow-indigo-500/40 transition-all">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-[#F8FAFC] tracking-tight text-base group-hover:text-white transition-colors">
                    PMIS Prime
                  </span>
                  <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/5 text-[#00D4FF] border border-white/10">
                    AI ALLOCATION
                  </span>
                </div>
                <span className="text-[10px] text-[#94A3B8] -mt-0.5 hidden sm:block">
                  National Internship Scheme
                </span>
              </div>
            </div>

            {/* Navigation Tabs (Frosted Pill Subnav) */}
            <div className="hidden lg:flex items-center space-x-1 p-1 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md">
              {[
                { id: 'home', label: 'Overview' },
                { id: 'ai-matching', label: 'AI Matcher', highlight: true },
                { id: 'internships', label: 'Vacancies' },
                { id: 'student-portal', label: 'Student' },
                { id: 'company-portal', label: 'Enterprise' },
                { id: 'admin-optimization', label: 'MIP Solver' },
                { id: 'analytics', label: 'Audit Analytics' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#6366F1]/80 to-[#8B5CF6]/80 text-white font-semibold shadow-md shadow-indigo-500/20 border border-white/15'
                      : tab.highlight
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#C084FC] font-semibold hover:bg-white/5'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Right Action: Demo Accounts & Profile */}
            <div className="flex items-center space-x-3">
              {/* Quick Demo Role Switcher */}
              <div className="hidden sm:flex items-center p-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px]">
                <button
                  onClick={() => demoLogin('student')}
                  className={`px-3 py-1 rounded-full transition-all font-semibold ${
                    user?.role === 'student'
                      ? 'bg-emerald-500 text-black shadow-xs'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                  title="Switch to Student Arjun Sharma"
                >
                  Student
                </button>
                <button
                  onClick={() => demoLogin('company')}
                  className={`px-3 py-1 rounded-full transition-all font-semibold ${
                    user?.role === 'company'
                      ? 'bg-blue-500 text-white shadow-xs'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                  title="Switch to TCS HR Enterprise"
                >
                  Company
                </button>
                <button
                  onClick={() => demoLogin('admin')}
                  className={`px-3 py-1 rounded-full transition-all font-semibold ${
                    user?.role === 'admin'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                  title="Switch to Director Rao (Admin)"
                >
                  Admin
                </button>
              </div>

              {/* User Action CTA */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      if (user?.role === 'student') setActiveTab('student-portal');
                      else if (user?.role === 'company') setActiveTab('company-portal');
                      else setActiveTab('admin-optimization');
                    }}
                    className="btn-glass-secondary px-3.5 py-1.5 rounded-full text-xs"
                  >
                    <span>{user?.full_name?.split(' ')[0] || 'Console'}</span>
                    <ChevronRight className="w-3 h-3 ml-1 text-[#00D4FF]" />
                  </button>
                  <button
                    onClick={logout}
                    className="p-1.5 rounded-full bg-white/5 hover:bg-red-500/20 text-[#94A3B8] hover:text-red-400 border border-white/10 transition"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setActiveTab('auth')}
                  className="btn-primary-gradient px-4 py-1.5 rounded-full text-xs font-semibold"
                >
                  <LogIn className="w-3.5 h-3.5 mr-1.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </nav>
    </header>
  );
}
