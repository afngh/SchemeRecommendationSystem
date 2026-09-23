import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Shield, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, KeyRound, ExternalLink } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/recommend';

  // Check URL query parameters for reset_token
  const queryParams = new URLSearchParams(location.search);
  const tokenFromUrl = queryParams.get('reset_token');

  // Mode: 'login' | 'forgot' | 'reset'
  const [viewMode, setViewMode] = useState(tokenFromUrl ? 'reset' : 'login');

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  // Reset Password State
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState(tokenFromUrl || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (tokenFromUrl) {
      setViewMode('reset');
      setResetToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  // Handle Email + Password Login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter your Email Address and Password.');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password.trim());
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => navigate(from, { replace: true }), 600);
    } catch (err) {
      setError(err.message || 'Login failed. Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Send Relogin Link
  const handleSendReloginLink = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setGeneratedLink('');

    if (!resetEmail.trim()) {
      setError('Please enter your registered Email Address.');
      return;
    }

    try {
      setLoading(true);
      const data = await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: resetEmail.trim() })
      });

      setSuccess(data.message || `Relogin link sent to ${resetEmail}.`);
      if (data.reset_link) {
        setGeneratedLink(data.reset_link);
      }
    } catch (err) {
      setError(err.message || 'Failed to send relogin link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Reset Password Submit
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const data = await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token: resetToken,
          new_password: newPassword
        })
      });

      setSuccess(data.message || 'Password reset successful!');
      setTimeout(() => {
        setViewMode('login');
        setSuccess('Password updated! Please log in with your new password.');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Password reset failed or link expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        
        {/* Emblem badge */}
        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 p-0.5 shadow-lg mx-auto flex items-center justify-center">
          <div className="h-full w-full rounded-full bg-[#064e3b] flex items-center justify-center border border-amber-300">
            <Shield className="h-8 w-8 text-amber-400" />
          </div>
        </div>

        <h2 className="text-2xl font-extrabold text-[#064e3b] tracking-tight">
          {viewMode === 'forgot' ? 'Forgot Password & Relogin' : viewMode === 'reset' ? 'Set New Password' : t('loginTitle')}
        </h2>
        <p className="text-xs text-[#475569]">
          {viewMode === 'forgot'
            ? 'Enter your registered email to receive a relogin link'
            : viewMode === 'reset'
            ? 'Enter your new password below'
            : 'Access Grama Ward Sachivalayam citizen portal with Email & Password'}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white border border-[#cbd5e1] rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
          
          {/* Feedback alerts */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* VIEW 1: Email + Password Login Form */}
          {viewMode === 'login' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#064e3b] uppercase tracking-wider mb-1">
                  Email Address (ఇమెయిల్ చిరునామా) *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="citizen@ap.gov.in"
                    className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] pl-10 pr-3 py-2.5 text-xs text-[#064e3b] focus:border-[#064e3b] focus:ring-2 focus:ring-[#064e3b]/20"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-[#064e3b] uppercase tracking-wider">
                    Password (పాస్‌వర్డ్) *
                  </label>
                  <button
                    type="button"
                    onClick={() => { setViewMode('forgot'); setError(''); setSuccess(''); }}
                    className="text-3xs text-emerald-700 font-bold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] pl-10 pr-3 py-2.5 text-xs text-[#064e3b] focus:border-[#064e3b] focus:ring-2 focus:ring-[#064e3b]/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#064e3b] hover:bg-[#047857] text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Signing In...' : t('login')} <ArrowRight className="h-4 w-4 text-amber-400" />
              </button>
            </form>
          )}

          {/* VIEW 2: Forgot Password / Send Relogin Link Form */}
          {viewMode === 'forgot' && (
            <form onSubmit={handleSendReloginLink} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#064e3b] uppercase tracking-wider mb-1">
                  Registered Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] pl-10 pr-3 py-2.5 text-xs text-[#064e3b] focus:border-[#064e3b] focus:ring-2 focus:ring-[#064e3b]/20"
                  />
                </div>
              </div>

              {generatedLink && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl space-y-1 text-3xs">
                  <span className="font-bold text-emerald-800 flex items-center gap-1">
                    <ExternalLink className="h-3.5 w-3.5" /> Direct Relogin Link:
                  </span>
                  <a
                    href={generatedLink}
                    className="text-[#064e3b] underline font-mono break-all hover:text-emerald-900 block"
                  >
                    {generatedLink}
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#064e3b] hover:bg-[#047857] text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Sending Link...' : 'Send Relogin Link to Email'} <ArrowRight className="h-4 w-4 text-amber-400" />
              </button>

              <button
                type="button"
                onClick={() => { setViewMode('login'); setError(''); setSuccess(''); }}
                className="w-full text-center text-xs font-bold text-slate-500 hover:text-[#064e3b] pt-1"
              >
                ← Back to Email & Password Login
              </button>
            </form>
          )}

          {/* VIEW 3: Reset Password Form */}
          {viewMode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#064e3b] uppercase tracking-wider mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                    className="w-full rounded-xl border-[#cbd5e1] bg-[#f4f7f4] pl-10 pr-3 py-2.5 text-xs text-[#064e3b] focus:border-[#064e3b] focus:ring-2 focus:ring-[#064e3b]/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#064e3b] hover:bg-[#047857] text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Updating Password...' : 'Save New Password & Log In'} <ArrowRight className="h-4 w-4 text-amber-400" />
              </button>
            </form>
          )}

          {/* Registration Redirect Link */}
          <div className="pt-4 border-t border-[#cbd5e1] text-center text-xs text-[#475569]">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-[#064e3b] hover:underline">
              {t('signup')}
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
