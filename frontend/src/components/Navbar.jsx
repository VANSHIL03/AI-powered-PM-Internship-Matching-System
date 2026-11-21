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
  UserCircle2,
  Sparkles,
  Layers,
  FileCheck
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, isAuthenticated, logout, demoLogin } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      {/* National Flag Tricolor Accent Bar */}
      <div className="h-1 w-full flex">
        <div className="w-1/3 bg-[#FF9933]"></div>
        <div className="w-1/3 bg-white"></div>
        <div className="w-1/3 bg-[#138808]"></div>
      </div>

      {/* Top Banner with Gov Branding & Quick Switcher */}
      <div className="bg-[#0B1E36] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 font-semibold text-amber-400 tracking-wide uppercase">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Government of India</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-200">Ministry of Corporate Affairs</span>
          </div>
          <span className="hidden md:inline-block px-2 py-0.5 rounded bg-blue-900/60 text-blue-200 border border-blue-700 font-mono text-[11px]">
            Manthan Kriti 2026 Hackathon
          </span>
        </div>

        {/* Quick Demo Switcher Buttons */}
        <div className="flex items-center space-x-2 mt-1 sm:mt-0">
          <span className="text-slate-400 text-[11px] hidden lg:inline">Quick Demo Roles:</span>
          <button
            onClick={() => demoLogin('student')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition flex items-center space-x-1 ${
              user?.role === 'student'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <GraduationCap className="w-3 h-3" />
            <span>Student</span>
          </button>
          <button
            onClick={() => demoLogin('company')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition flex items-center space-x-1 ${
              user?.role === 'company'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>Company</span>
          </button>
          <button
            onClick={() => demoLogin('admin')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition flex items-center space-x-1 ${
              user?.role === 'admin'
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Identity */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0F2A4A] to-[#107E54] flex items-center justify-center text-white shadow-sm font-bold text-lg border border-slate-700 group-hover:scale-105 transition-transform">
              PM
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-base leading-tight flex items-center space-x-2">
                <span>PM Internship Scheme</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-300">
                  AI-ALLOCATION
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium tracking-tight">
                Large-Scale Intelligent Matching & Optimization System
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                activeTab === 'home'
                  ? 'bg-slate-100 text-[#0F2A4A] font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => setActiveTab('internships')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'internships'
                  ? 'bg-slate-100 text-[#0F2A4A] font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>Internships</span>
            </button>

            <button
              onClick={() => setActiveTab('ai-matching')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'ai-matching'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>AI Engine</span>
            </button>

            {/* Role-Specific Portals */}
            {(!user || user.role === 'student' || user.role === 'admin') && (
              <button
                onClick={() => setActiveTab('student-portal')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center space-x-1.5 ${
                  activeTab === 'student-portal'
                    ? 'bg-blue-50 text-blue-900 font-semibold border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Student Portal</span>
              </button>
            )}

            {(!user || user.role === 'company' || user.role === 'admin') && (
              <button
                onClick={() => setActiveTab('company-portal')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center space-x-1.5 ${
                  activeTab === 'company-portal'
                    ? 'bg-amber-50 text-amber-900 font-semibold border border-amber-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-4 h-4 text-amber-600" />
                <span>Company Portal</span>
              </button>
            )}

            {(!user || user.role === 'admin') && (
              <button
                onClick={() => setActiveTab('admin-optimization')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center space-x-1.5 ${
                  activeTab === 'admin-optimization'
                    ? 'bg-purple-50 text-purple-900 font-semibold border border-purple-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Cpu className="w-4 h-4 text-purple-600" />
                <span>Optimization</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-slate-100 text-[#0F2A4A] font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-slate-500" />
              <span>Analytics</span>
            </button>
          </nav>

          {/* User Status / Auth Actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
                    {user?.full_name}
                  </div>
                  <div className="text-[11px] text-slate-500 capitalize flex items-center justify-end space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{user?.role}</span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('auth')}
                className="px-4 py-2 rounded-lg bg-[#0F2A4A] text-white text-xs font-semibold hover:bg-[#0B1E36] transition flex items-center space-x-1.5 shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
