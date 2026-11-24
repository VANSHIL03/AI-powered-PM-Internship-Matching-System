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
  Zap
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, isAuthenticated, logout, demoLogin } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Apple-style Announcement Ribbon */}
      <div className="bg-[#121214] border-b border-white/5 py-1.5 px-4 text-center text-[11px] text-[#A1A1A6] font-normal tracking-tight">
        <span>Manthan Kriti 2026 &nbsp;|&nbsp; </span>
        <span className="text-white font-medium">Prime Minister's Internship Scheme (PMIS)</span>
        <span className="text-white/40 mx-2">•</span>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2997FF] via-[#BF5AF2] to-[#FF375F] font-semibold">
          Powered by Google OR-Tools AI Optimization
        </span>
      </div>

      {/* Main Glassmorphism Navbar */}
      <nav className="backdrop-blur-xl bg-black/75 border-b border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            
            {/* Logo / Brand Name */}
            <div 
              onClick={() => setActiveTab('home')}
              className="flex items-center space-x-2.5 cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#2997FF] via-[#BF5AF2] to-[#FF375F] flex items-center justify-center text-white text-xs font-black shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                PM
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white tracking-tight text-sm group-hover:text-white/90">
                  PM Internship
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-white/10 text-[#2997FF] border border-white/10">
                  AI ALLOCATION
                </span>
              </div>
            </div>

            {/* Navigation Tabs (Apple Subnav Style) */}
            <div className="hidden lg:flex items-center space-x-1">
              {[
                { id: 'home', label: 'Overview' },
                { id: 'ai-matching', label: 'AI Engine', highlight: true },
                { id: 'internships', label: 'Opportunities' },
                { id: 'student-portal', label: 'Student' },
                { id: 'company-portal', label: 'Enterprise' },
                { id: 'admin-optimization', label: 'Optimization' },
                { id: 'analytics', label: 'Analytics' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 rounded-full text-xs transition-all ${
                    activeTab === tab.id
                      ? 'bg-white/15 text-white font-semibold shadow-xs'
                      : tab.highlight
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#2997FF] to-[#BF5AF2] font-semibold hover:bg-white/5'
                      : 'text-[#86868B] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Right Action: Demo Accounts & Profile */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Quick Demo Role Switcher (Apple Glass Pill) */}
              <div className="hidden sm:flex items-center p-0.5 rounded-full bg-white/5 border border-white/10 text-[11px]">
                <button
                  onClick={() => demoLogin('student')}
                  className={`px-2.5 py-1 rounded-full transition font-medium ${
                    user?.role === 'student'
                      ? 'bg-[#30D158] text-black font-bold shadow-xs'
                      : 'text-[#A1A1A6] hover:text-white'
                  }`}
                  title="Switch to Student Arjun Sharma"
                >
                  Student
                </button>
                <button
                  onClick={() => demoLogin('company')}
                  className={`px-2.5 py-1 rounded-full transition font-medium ${
                    user?.role === 'company'
                      ? 'bg-[#FF9F0A] text-black font-bold shadow-xs'
                      : 'text-[#A1A1A6] hover:text-white'
                  }`}
                  title="Switch to Company TCS"
                >
                  Company
                </button>
                <button
                  onClick={() => demoLogin('admin')}
                  className={`px-2.5 py-1 rounded-full transition font-medium ${
                    user?.role === 'admin'
                      ? 'bg-[#2997FF] text-white font-bold shadow-xs'
                      : 'text-[#A1A1A6] hover:text-white'
                  }`}
                  title="Switch to Admin Director"
                >
                  Admin
                </button>
              </div>

              {/* Login / User Status */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <div className="text-right hidden md:block">
                    <div className="text-xs font-semibold text-white truncate max-w-[120px]">
                      {user?.full_name?.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-[#86868B] capitalize">
                      {user?.role}
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-1.5 rounded-full text-[#86868B] hover:text-white hover:bg-white/10 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setActiveTab('auth')}
                  className="px-3.5 py-1.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold transition shadow-xs flex items-center space-x-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
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
