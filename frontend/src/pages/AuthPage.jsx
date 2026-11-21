import React, { useState } from 'react';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { 
  LogIn, 
  UserPlus, 
  GraduationCap, 
  Building2, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  User,
  Phone
} from 'lucide-react';

export default function AuthPage({ setActiveTab }) {
  const { login, register, demoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('student'); // student, company, admin

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          email,
          password,
          full_name: fullName,
          role,
          phone
        });
      } else {
        await login(email, password);
      }

      // Route to respective portal
      if (role === 'student') setActiveTab('student-portal');
      else if (role === 'company') setActiveTab('company-portal');
      else setActiveTab('admin-optimization');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async (accountRole) => {
    setError('');
    setLoading(true);
    try {
      await demoLogin(accountRole);
      if (accountRole === 'student') setActiveTab('student-portal');
      else if (accountRole === 'company') setActiveTab('company-portal');
      else setActiveTab('admin-optimization');
    } catch (err) {
      setError('Could not sign in with demo credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      {/* 1-Click Evaluation Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900 mb-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Evaluation Shortcut: 1-Click Demo Accounts</span>
        </div>
        <p className="text-[11px] text-amber-800 mb-3">
          Click any role below to sign in instantly with fully configured seed profiles:
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleDemoSignIn('student')}
            className="p-2 rounded-xl bg-white border border-amber-300 hover:bg-emerald-50 hover:border-emerald-500 text-slate-800 text-[11px] font-bold text-center transition flex flex-col items-center space-y-1 shadow-xs"
          >
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>Student</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemoSignIn('company')}
            className="p-2 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 hover:border-amber-600 text-slate-800 text-[11px] font-bold text-center transition flex flex-col items-center space-y-1 shadow-xs"
          >
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>Company</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemoSignIn('admin')}
            className="p-2 rounded-xl bg-white border border-amber-300 hover:bg-blue-50 hover:border-blue-600 text-slate-800 text-[11px] font-bold text-center transition flex flex-col items-center space-y-1 shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* Main Auth Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Toggle Login / Register */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 py-3.5 text-center text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
              !isRegister
                ? 'bg-white text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 py-3.5 text-center text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
              isRegister
                ? 'bg-white text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>New Registration</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Portal Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'student', label: 'Student', icon: GraduationCap },
                { id: 'company', label: 'Company', icon: Building2 },
                { id: 'admin', label: 'Admin', icon: ShieldCheck }
              ].map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold border flex flex-col items-center space-y-1 transition ${
                      role === r.id
                        ? 'bg-[#0F2A4A] text-white border-[#0F2A4A]'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Registration Extra Fields */}
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {role === 'company' ? 'Enterprise / Organization Name' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={role === 'company' ? 'e.g. Tata Advanced Systems' : 'e.g. Arjun Sharma'}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F2A4A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91-9876543210"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F2A4A]"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="candidate@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F2A4A]"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F2A4A]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#0F2A4A] text-white font-bold text-xs hover:bg-[#0B1E36] transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : (isRegister ? 'Complete Registration' : 'Sign In to Portal')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
