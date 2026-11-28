import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail, ShieldAlert, Eye, EyeOff, ShieldCheck, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (from === '/') {
        const rolePath = data.user?.role === 'COLLECTION_STAFF'
          ? '/collector/dashboard'
          : data.user?.role === 'READ_ONLY_AUDITOR'
            ? '/auditor/dashboard'
            : '/admin/dashboard';
        navigate(rolePath, { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setForgotMessage('');
    try {
      const response = await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotMessage(response.data.message || 'Request submitted.');
    } catch {
      setForgotMessage('Unable to submit request. Please contact your administrator.');
    }
  };

  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="login-shell">
      <div className="login-ambient" aria-hidden="true">
        <div className="login-grid" />
        <div className="login-orb login-orb-lime" />
        <div className="login-orb login-orb-blue" />
      </div>
      <div className="login-layout">
        <section className="login-intro" aria-label="TamilFins">
          <a className="login-brand" href="/login" aria-label={t('TamilFins home')}>
            <span className="login-brand-mark"><img src="/tamilfins-logo.jpg" alt="" /></span>
            <span className="login-brand-copy"><span className="login-brand-name">Tamil<span>Fins</span></span><small>{t('Plan • Grow • Prosper')}</small></span>
          </a>
          <div className="login-intro-copy">
            <p className="login-kicker"><span /> {t('Intelligent finance platform')}</p>
            <h1>{t('Every rupee,')}<br /><em>{t('accounted for.')}</em></h1>
            <p className="login-intro-text">{t('Streamline collections, automate repayment tracking, and unlock real-time financial clarity — all from one powerful command centre.')}</p>
            <div className="login-visual">
              <div className="login-visual-top">
                <div><span className="visual-label">{t('LIVE DASHBOARD')}</span><strong>{t('Command Centre')}</strong></div>
                <span className="visual-icon"><TrendingUp size={19} /></span>
              </div>
              <div className="visual-chart" aria-hidden="true">
                <div className="visual-chart-lines"><i /><i /><i /><i /></div>
                <svg viewBox="0 0 420 120" preserveAspectRatio="none">
                  <defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#13A89E" stopOpacity=".35" /><stop offset="1" stopColor="#13A89E" stopOpacity="0" /></linearGradient><linearGradient id="chartStroke"><stop stopColor="#13A89E" /><stop offset="1" stopColor="#A58BEA" /></linearGradient></defs>
                  <path className="visual-chart-area" d="M0 94 C38 84 44 68 82 75 S132 94 168 61 220 70 250 48 302 68 333 35 382 42 420 12 V120 H0Z" />
                  <path className="visual-chart-line" d="M0 94 C38 84 44 68 82 75 S132 94 168 61 220 70 250 48 302 68 333 35 382 42 420 12" />
                  <circle cx="333" cy="35" r="5" /><circle className="visual-chart-pulse" cx="333" cy="35" r="10" />
                </svg>
              </div>
              <div className="login-visual-bottom"><span><i className="status-dot" /> {t('Real-time collection intelligence')}</span><b>{t('Built for precision')} ↗</b></div>
            </div>
            <p className="login-trust-note"><ShieldCheck size={16} /> {t('Role-based access')} <i /> {t('Secure sign-in')}</p>
          </div>
        </section>

        <section className="login-form-side">
          <div className="login-lang-bar">
            <label htmlFor="login-language">{t('Language')}</label>
            <select id="login-language" value={language} onChange={(event) => setLanguage(event.target.value)}>
              <option value="en">English</option><option value="ta">தமிழ்</option><option value="hi">हिन्दी</option>
            </select>
          </div>
          <div className="login-card">
            <div className="login-card-head"><div className="login-card-brand"><img src="/tamilfins-logo.jpg" alt="TamilFins" /><strong>TamilFins</strong></div><span className="login-card-secure">{t('SECURE PORTAL')}</span></div>
            <p className="login-card-overline">{t('WELCOME BACK')}</p>
            <h2>{t('Sign in to portal')}</h2>
            <p className="login-card-subtitle">{t('Enter your account details to access your workspace.')}</p>
            {error && <div className="login-error" role="alert"><ShieldAlert size={17} /> <span>{error}</span></div>}
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-field">
                <label htmlFor="login-email">{t('Email address')}</label>
                <div className="login-input-wrap"><Mail size={17} /><input id="login-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" /></div>
              </div>
              <div className="login-field">
                <div className="login-label-row"><label htmlFor="login-password">{t('Password')}</label><button type="button" className="login-text-button" onClick={() => { setForgotEmail(email); setForgotMessage(''); setForgotModalOpen(true); }}>{t('Forgot password?')}</button></div>
                <div className="login-input-wrap"><LockKeyhole size={17} /><input className="login-password-input" id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" /><button type="button" className="login-password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? t('Hide password') : t('Show password')}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
              </div>
              <label className="login-remember"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />{t('Remember Me')}</label>
              <button type="submit" className="login-submit" disabled={loading}>{loading ? t('Signing in…') : t('Sign in to portal')} {!loading && <ArrowRight size={17} />}</button>
            </form>
            <div className="login-demo">
              <div className="login-demo-heading"><span />{t('Quick demo access')}<span /></div>
              <div className="login-demo-buttons">
                <button type="button" onClick={() => fillCredentials('admin@tridin.com', 'Admin@123')}><i className="demo-dot demo-admin" />{t('Admin Dashboard')}</button>
                <button type="button" onClick={() => fillCredentials('staff@tridin.com', 'Staff@123')}><i className="demo-dot demo-staff" />{t('Collector Portal')}</button>
                <button type="button" onClick={() => fillCredentials('auditor@tridin.com', 'Auditor@123')}><i className="demo-dot demo-auditor" />{t('Auditor Portal')}</button>
              </div>
            </div>
          </div>
          <p className="login-footer">{t('Bank-grade encryption')} <span /> {t('TamilFins Management System')}</p>
        </section>
      </div>

      {forgotModalOpen && <div className="login-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setForgotModalOpen(false); }}>
        <section className="login-modal" role="dialog" aria-modal="true" aria-labelledby="forgot-title">
          <button className="login-modal-close" type="button" onClick={() => setForgotModalOpen(false)} aria-label={t('Close')}>×</button>
          <span className="login-card-icon"><Mail size={19} /></span><h2 id="forgot-title">{t('Forgot Password')}</h2>
          <p>{t('Enter your email and your administrator will help you regain access.')}</p>
          <form className="login-form" onSubmit={handleForgotPassword}>
            <div className="login-field"><label htmlFor="forgot-email">{t('Email address')}</label><div className="login-input-wrap"><Mail size={17} /><input id="forgot-email" type="email" required value={forgotEmail} onChange={(event) => setForgotEmail(event.target.value)} placeholder="name@company.com" /></div></div>
            <button type="submit" className="login-submit">{t('Submit')} <ArrowRight size={17} /></button>
            {forgotMessage && <p className="login-modal-message" role="status">{forgotMessage}</p>}
          </form>
        </section>
      </div>}
    </div>
  );
};

export default Login;
