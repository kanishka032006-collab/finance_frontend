import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
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
  const { language, setLanguage, t } = useLanguage();
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
        <section className="login-intro" aria-label="TamilFins">
          <a className="login-brand" href="/login" aria-label="TamilFins home">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border-2 border-[#2446A8]/30 shadow-md flex items-center justify-center p-1 overflow-hidden shrink-0 ring-4 ring-[#2446A8]/10 aspect-square">
              <img
                src="/tamilfins-logo.jpg"
                alt="TamilFins"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="login-brand-name">
                <span className="text-[#0B47A8]">{language === 'ta' ? 'தமிழ்' : 'Tamil'}</span>
                <span className="text-[#00A843]">{language === 'ta' ? 'ஃபின்ஸ்' : 'Fins'}</span>
              </span>
              <span className="text-[10px] text-[#13A89E] font-bold tracking-wider truncate">
                {language === 'ta' ? 'திட்டமிடு • வளர் • முன்னேறு' : 'Plan • Grow • Prosper'}
              </span>
            </div>
          </a>

          <div className="login-intro-copy">
            <p className="login-kicker"><span /> {t('Intelligent finance platform')}</p>
            <h1>{t('Every rupee,')}<br /><em>{t('accounted for.')}</em></h1>
            <p className="login-intro-text">
              {t('Streamline collections, automate repayment tracking, and unlock real-time financial clarity — all from one powerful command centre.')}
            </p>
          </div>

          <div className="login-visual" aria-hidden="true">
            <div className="login-visual-top">
              <div>
                <span className="visual-label">{t('LIVE DASHBOARD')}</span>
                <strong>{t('Command Centre')}</strong>
              </div>
              <span className="visual-icon"><TrendingUp size={18} /></span>
            </div>
            <div className="visual-chart">
              <div className="visual-chart-lines"><i /><i /><i /><i /></div>
              <svg viewBox="0 0 520 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartStroke" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#A58BEA" stopOpacity=".65" />
                    <stop offset="55%" stopColor="#13A89E" />
                    <stop offset="100%" stopColor="#E7A94B" />
                  </linearGradient>
                  <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#13A89E" stopOpacity=".28" />
                    <stop offset="100%" stopColor="#13A89E" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path className="visual-chart-area" d="M0 120 C35 112 47 92 78 98 S126 120 160 84 S210 89 245 67 S295 89 330 53 S380 67 410 42 S462 50 520 14 V150 H0Z" />
                <path className="visual-chart-line" d="M0 120 C35 112 47 92 78 98 S126 120 160 84 S210 89 245 67 S295 89 330 53 S380 67 410 42 S462 50 520 14" />
                <circle cx="410" cy="42" r="4" />
                <circle className="visual-chart-pulse" cx="410" cy="42" r="10" />
              </svg>
            </div>
            <div className="login-visual-bottom">
              <span><i className="status-dot" /> {t('Real-time collection intelligence')}</span>
              <span>{t('Built for precision')} <b>↗</b></span>
            </div>
          </div>

          <div className="login-trust-note">
            <ShieldCheck size={16} />
            <span>{t('Role-based access')} <i /> {t('Secure sign-in')}</span>
          </div>
        </section>

        <section className="login-form-side" aria-label="Sign in">
          <label className="login-lang-bar">
            <span>மொழி / Language</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              aria-label="Language"
            >
              <option value="en">English</option>
              <option value="ta">தமிழ்</option>
            </select>
          </label>
          <div className="login-card">
            <div className="login-card-head">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white border border-[#2446A8]/30 shadow-xs flex items-center justify-center p-0.5 overflow-hidden shrink-0 ring-2 ring-[#2446A8]/10 aspect-square">
                  <img
                    src="/tamilfins-logo.jpg"
                    alt="TamilFins"
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
                <span className="text-xs font-extrabold text-[#2446A8]">
                  {language === 'ta' ? 'தமிழ்ஃபின்ஸ்' : 'TamilFins'}
                </span>
              </div>
              <span className="login-card-secure">{t('SECURE PORTAL')}</span>
            </div>

            <p className="login-card-overline">{t('WELCOME BACK')}</p>
            <h2>{t('Sign in to continue')}</h2>
            <p className="login-card-subtitle">{t('Enter your account details to access your workspace.')}</p>

            {error && (
              <div className="login-error" role="alert">
                <ShieldAlert size={17} />
                <span>{error}</span>
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-field">
                <label htmlFor="login-email">{t('Email address')}</label>
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
                  <label htmlFor="login-password">{t('Password')}</label>
                  <button type="button" className="login-text-button" onClick={() => setForgotModalOpen(true)}>
                    {t('Forgot password?')}
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
                    placeholder={t('Enter your password')}
                  />
                </div>
              </div>

              <button type="submit" className="login-submit" disabled={loading}>
                <span>{loading ? t('Authenticating…') : t('Sign in to portal')}</span>
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="login-demo">
              <div className="login-demo-heading"><span /> {t('Quick demo access')} <span /></div>
              <div className="login-demo-buttons">
                <button type="button" onClick={() => fillCredentials('admin@tridin.com', 'Admin@123')}>
                  <b className="demo-dot demo-admin" />{t('Admin')}
                </button>
                <button type="button" onClick={() => fillCredentials('staff@tridin.com', 'Staff@123')}>
                  <b className="demo-dot demo-staff" />{t('Collector')}
                </button>
                <button type="button" onClick={() => fillCredentials('auditor@tridin.com', 'Auditor@123')}>
                  <b className="demo-dot demo-auditor" />{t('Auditor')}
                </button>
              </div>
            </div>
          </div>

          <p className="login-footer">{t('Bank-grade encryption')} <span /> {t('TamilFins Management System')}</p>
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
            <h3 id="reset-title">{t('Reset password')}</h3>
            <p>{t('Enter your registered email to send a password reset request to your administrator.')}</p>
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
                    placeholder={t('Enter email address')}
                  />
                </div>
                <button type="submit" className="login-submit">{t('Send request')} <ArrowRight size={17} /></button>
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
              {t('Close')}
            </button>
          </section>
        </div>
      )}
    </div>
  );
};

export default Login;
