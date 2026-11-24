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
    <div className="min-h-[85vh] py-16 px-4 flex flex-col justify-center font-sans selection:bg-[#7C3AED] selection:text-white">
      <div className="max-w-md mx-auto w-full space-y-6">
        
        {/* Quick Demo Login Card */}
        <div className="glass-panel p-6 space-y-3.5">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Evaluation Shortcut: 1-Click Demo Accounts</span>
          </div>
          <p className="text-[11px] text-[#94A3B8]">
            Sign in instantly with pre-seeded role credentials:
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => handleDemoSignIn('student')}
              className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-emerald-500/50 text-[#F8FAFC] text-xs font-semibold text-center transition flex flex-col items-center space-y-1.5 hover:bg-emerald-500/10"
            >
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoSignIn('company')}
              className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-amber-500/50 text-[#F8FAFC] text-xs font-semibold text-center transition flex flex-col items-center space-y-1.5 hover:bg-amber-500/10"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Company</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoSignIn('admin')}
              className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#00D4FF]/50 text-[#F8FAFC] text-xs font-semibold text-center transition flex flex-col items-center space-y-1.5 hover:bg-[#00D4FF]/10"
            >
              <ShieldCheck className="w-4 h-4 text-[#00D4FF]" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Main Auth Card */}
        <div className="glass-panel overflow-hidden">
          {/* Tab Bar */}
          <div className="flex border-b border-white/10 bg-white/[0.02]">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-3.5 text-center text-xs font-bold transition flex items-center justify-center space-x-2 ${
                !isRegister
                  ? 'bg-gradient-to-r from-[#6366F1]/80 to-[#8B5CF6]/80 text-white font-semibold'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 py-3.5 text-center text-xs font-bold transition flex items-center justify-center space-x-2 ${
                isRegister
                  ? 'bg-gradient-to-r from-[#6366F1]/80 to-[#8B5CF6]/80 text-white font-semibold'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>New Registration</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs animate-in fade-in">
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
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
                          ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white border-white/20 shadow-md shadow-indigo-500/20'
                          : 'bg-white/[0.04] text-[#94A3B8] border-white/10 hover:text-white'
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
                  <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                    {role === 'company' ? 'Enterprise Name' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={role === 'company' ? 'e.g. Tata Advanced Systems' : 'e.g. Arjun Sharma'}
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#00D4FF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91-9876543210"
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#00D4FF]"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#00D4FF]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#00D4FF]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary-gradient w-full py-3.5 rounded-full text-xs font-bold space-x-2 disabled:opacity-50 mt-2"
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
