import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ShieldAlert, ArrowRight } from 'lucide-react';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      if (from === '/') {
        if (data.user?.role === 'COLLECTION_STAFF') {
          navigate('/collector/dashboard', { replace: true });
        } else if (data.user?.role === 'READ_ONLY_AUDITOR') {
          navigate('/auditor/dashboard', { replace: true });
        } else {
          navigate('/admin/dashboard', { replace: true });
        }
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMessage('');
    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotMessage(res.data.message || 'Request submitted.');
    } catch (err) {
      setForgotMessage('Unable to submit request. Please contact your administrator.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9EAD7] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-900 text-[#BFE23A] font-black flex items-center justify-center text-2xl shadow-lg border border-slate-800">
          T
        </div>
        <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900">
          TRIDIN SOFTWARE
        </h2>
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mt-0.5">
          Finance Collection Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-premium rounded-2xl sm:px-10 border border-stone-200">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-[#E10600]">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tridin.com"
                  className="block w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] focus:border-slate-900 bg-stone-50/50"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-xs text-slate-500 hover:text-slate-900 font-semibold transition"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] focus:border-slate-900 bg-stone-50/50"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-slate-950 bg-[#BFE23A] hover:bg-[#aed12b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BFE23A] disabled:opacity-50 transition"
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>

          {/* Quick Demo Credential Fillers */}
          <div className="mt-6 pt-5 border-t border-stone-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Quick Test Credentials (One-Click)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin@tridin.com', 'Admin@123')}
                className="py-2 px-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-[11px] font-bold text-purple-900 transition text-center"
              >
                Admin Portal
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('staff@tridin.com', 'Staff@123')}
                className="py-2 px-2 bg-[#BFE23A]/20 hover:bg-[#BFE23A]/40 border border-[#BFE23A]/50 rounded-xl text-[11px] font-black text-slate-950 transition text-center"
              >
                Collector Portal
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('auditor@tridin.com', 'Auditor@123')}
                className="py-2 px-2 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl text-[11px] font-bold text-slate-800 transition text-center"
              >
                Auditor Portal
              </button>
            </div>
          </div>
        </div>

        {/* Security & System Info Footer */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Protected by Enterprise JWT Authentication & PostgreSQL Row Constraints.
        </p>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-left">
            <h3 className="text-base font-bold text-slate-900 mb-1">Reset Password</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your registered staff email address to log a password reset request.
            </p>
            {forgotMessage ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 mb-4">
                {forgotMessage}
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter email"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#BFE23A]"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-[#BFE23A] text-slate-900 font-bold text-xs rounded-xl hover:bg-[#aed12b]"
                >
                  Send Request
                </button>
              </form>
            )}
            <button
              type="button"
              onClick={() => {
                setForgotModalOpen(false);
                setForgotMessage('');
              }}
              className="mt-3 w-full py-1.5 text-xs text-slate-600 hover:text-slate-900 text-center"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
