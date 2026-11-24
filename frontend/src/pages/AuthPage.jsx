import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
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
  const [role, setRole] = useState('student');

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
    <div className="bg-[#000000] text-white min-h-[85vh] py-16 px-4 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full space-y-6">
        
        {/* Quick Demo Login Card (Apple Glass) */}
        <div className="p-5 rounded-3xl bg-[#161617] border border-white/10 space-y-3">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-[#FF9F0A]">
            <Sparkles className="w-4 h-4 text-[#FF9F0A]" />
            <span>Evaluation Shortcut: 1-Click Demo Accounts</span>
          </div>
          <p className="text-[11px] text-[#86868B]">
            Sign in instantly with fully configured seed accounts:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoSignIn('student')}
              className="p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#30D158] text-white text-xs font-semibold text-center transition flex flex-col items-center space-y-1 hover:bg-[#30D158]/10"
            >
              <GraduationCap className="w-4 h-4 text-[#30D158]" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoSignIn('company')}
              className="p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FF9F0A] text-white text-xs font-semibold text-center transition flex flex-col items-center space-y-1 hover:bg-[#FF9F0A]/10"
            >
              <Building2 className="w-4 h-4 text-[#FF9F0A]" />
              <span>Company</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoSignIn('admin')}
              className="p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#2997FF] text-white text-xs font-semibold text-center transition flex flex-col items-center space-y-1 hover:bg-[#2997FF]/10"
            >
              <ShieldCheck className="w-4 h-4 text-[#2997FF]" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Main Auth Card */}
        <div className="bg-[#161617] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          {/* Tab Bar */}
          <div className="flex border-b border-white/10 bg-black/40">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-3.5 text-center text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                !isRegister
                  ? 'bg-[#161617] text-white border-b-2 border-[#2997FF]'
                  : 'text-[#86868B] hover:text-white'
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
                  ? 'bg-[#161617] text-white border-b-2 border-[#2997FF]'
                  : 'text-[#86868B] hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>New Registration</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-2">
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
                      className={`py-2 px-1 rounded-2xl text-xs font-semibold border flex flex-col items-center space-y-1 transition ${
                        role === r.id
                          ? 'bg-white text-black border-white'
                          : 'bg-white/5 text-[#86868B] border-white/10 hover:text-white'
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {role === 'company' ? 'Enterprise Name' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={role === 'company' ? 'e.g. Tata Advanced Systems' : 'e.g. Arjun Sharma'}
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-[#2997FF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91-9876543210"
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-[#2997FF]"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-[#2997FF]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-[#2997FF]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-bold text-xs transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : (isRegister ? 'Complete Registration' : 'Sign In')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
