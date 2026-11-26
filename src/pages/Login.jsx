import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, LockKeyhole, Mail, ShieldAlert, ShieldCheck, TrendingUp } from 'lucide-react';
import api from '../services/api';
import './Login.css';

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
    <div className="login-shell">
      <div className="login-ambient" aria-hidden="true">
        <span className="login-orb login-orb-lime" />
        <span className="login-orb login-orb-blue" />
        <span className="login-grid" />
      </div>

      <main className="login-layout">
        <section className="login-intro" aria-label="Tridin Finance">
          <a className="login-brand" href="/login" aria-label="Tridin Finance home">
            <span className="login-brand-mark">T</span>
            <span className="login-brand-name">TRIDIN <b>FINANCE</b></span>
          </a>

          <div className="login-intro-copy">
            <p className="login-kicker"><span /> Finance operations suite</p>
            <h1>Collections,<br /><em>in clear view.</em></h1>
            <p className="login-intro-text">
              A calmer way to manage customers, track repayments, and keep every collection moving.
            </p>
          </div>

          <div className="login-visual" aria-hidden="true">
            <div className="login-visual-top">
              <div>
                <span className="visual-label">COLLECTION OVERVIEW</span>
                <strong>Finance workspace</strong>
              </div>
              <span className="visual-icon"><TrendingUp size={18} /></span>
            </div>
            <div className="visual-chart">
              <div className="visual-chart-lines"><i /><i /><i /><i /></div>
              <svg viewBox="0 0 520 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartStroke" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#bfe23a" stopOpacity=".35" />
                    <stop offset="100%" stopColor="#d8f77c" />
                  </linearGradient>
                  <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#bfe23a" stopOpacity=".2" />
                    <stop offset="100%" stopColor="#bfe23a" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path className="visual-chart-area" d="M0 120 C35 112 47 92 78 98 S126 120 160 84 S210 89 245 67 S295 89 330 53 S380 67 410 42 S462 50 520 14 V150 H0Z" />
                <path className="visual-chart-line" d="M0 120 C35 112 47 92 78 98 S126 120 160 84 S210 89 245 67 S295 89 330 53 S380 67 410 42 S462 50 520 14" />
                <circle cx="410" cy="42" r="4" />
                <circle className="visual-chart-pulse" cx="410" cy="42" r="10" />
              </svg>
            </div>
            <div className="login-visual-bottom">
              <span><i className="status-dot" /> Secure collection management</span>
              <span>Built for clarity <b>↗</b></span>
            </div>
          </div>

          <div className="login-trust-note">
            <ShieldCheck size={16} />
            <span>Role-based access <i /> Secure sign-in</span>
          </div>
        </section>

        <section className="login-form-side" aria-label="Sign in">
          <div className="login-card">
            <div className="login-card-head">
              <span className="login-card-icon"><LockKeyhole size={18} /></span>
              <span className="login-card-secure">SECURE PORTAL</span>
            </div>

            <p className="login-card-overline">WELCOME BACK</p>
            <h2>Sign in to continue</h2>
            <p className="login-card-subtitle">Enter your account details to access your workspace.</p>

            {error && (
              <div className="login-error" role="alert">
                <ShieldAlert size={17} />
                <span>{error}</span>
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-field">
                <label htmlFor="login-email">Email address</label>
                <div className="login-input-wrap">
                  <Mail size={17} />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@tridin.com"
                  />
                </div>
              </div>

              <div className="login-field">
                <div className="login-label-row">
                  <label htmlFor="login-password">Password</label>
                  <button type="button" className="login-text-button" onClick={() => setForgotModalOpen(true)}>
                    Forgot password?
                  </button>
                </div>
                <div className="login-input-wrap">
                  <LockKeyhole size={17} />
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <button type="submit" className="login-submit" disabled={loading}>
                <span>{loading ? 'Authenticating…' : 'Sign in to portal'}</span>
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="login-demo">
              <div className="login-demo-heading"><span /> Quick demo access <span /></div>
              <div className="login-demo-buttons">
                <button type="button" onClick={() => fillCredentials('admin@tridin.com', 'Admin@123')}>
                  <b className="demo-dot demo-admin" />Admin
                </button>
                <button type="button" onClick={() => fillCredentials('staff@tridin.com', 'Staff@123')}>
                  <b className="demo-dot demo-staff" />Collector
                </button>
                <button type="button" onClick={() => fillCredentials('auditor@tridin.com', 'Auditor@123')}>
                  <b className="demo-dot demo-auditor" />Auditor
                </button>
              </div>
            </div>
          </div>

          <p className="login-footer">Protected with encrypted sessions <span /> Tridin Finance Management</p>
        </section>
      </main>

      {forgotModalOpen && (
        <div className="login-modal-backdrop" role="presentation" onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            setForgotModalOpen(false);
            setForgotMessage('');
          }
        }}>
          <section className="login-modal" role="dialog" aria-modal="true" aria-labelledby="reset-title">
            <div className="login-modal-icon"><Mail size={18} /></div>
            <h3 id="reset-title">Reset password</h3>
            <p>Enter your registered email to send a password reset request to your administrator.</p>
            {forgotMessage ? (
              <div className="login-success" role="status">{forgotMessage}</div>
            ) : (
              <form onSubmit={handleForgotPassword} className="login-form">
                <div className="login-input-wrap">
                  <Mail size={17} />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
                <button type="submit" className="login-submit">Send request <ArrowRight size={17} /></button>
              </form>
            )}
            <button
              type="button"
              className="login-modal-close"
              onClick={() => {
                setForgotModalOpen(false);
                setForgotMessage('');
              }}
            >
              Close
            </button>
          </section>
        </div>
      )}
    </div>
  );
};

export default Login;
