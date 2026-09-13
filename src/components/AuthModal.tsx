import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Sparkles, CheckCircle2, AlertCircle, Compass, Target, Clock, ShieldCheck, ArrowLeft, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export interface AuthModalProps {
  onClose?: () => void;
  initialMode?: 'login' | 'signup' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, initialMode = 'login' }) => {
  const { signIn, signUp, signInWithGoogle, resetPassword, error, clearError } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSwitchMode = (newMode: 'login' | 'signup' | 'forgot') => {
    setMode(newMode);
    clearError();
    setLocalError(null);
    setResetSent(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (mode === 'signup') {
      if (!displayName.trim()) {
        setLocalError('Please enter your full name or nickname.');
        return;
      }
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters long.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else if (mode === 'signup') {
        await signUp(email, password, displayName);
      } else if (mode === 'forgot') {
        if (!email.trim()) {
          setLocalError('Please enter your email address.');
          setIsLoading(false);
          return;
        }
        await resetPassword(email);
        setResetSent(true);
      }
    } catch (err: unknown) {
      console.warn('Auth error caught:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    setLocalError(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      console.warn('Google sign-in error caught:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeError = localError || error;

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-indigo-50/20 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {onClose && (
        <div className="absolute top-6 left-6 z-10">
          <button
            id="btn-back-to-landing"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-xs transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>
      )}

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-4 tracking-wide shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>focusflow.in • Student Workspace</span>
        </div>
        
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Focus Flow
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
          The all-in-one personalized study workspace to plan studies, master tasks, and build unstoppable focus habits.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200/80 sm:px-10">
          {/* Mode Switcher Tabs */}
          {mode !== 'forgot' ? (
            <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
              <button
                id="tab-login"
                type="button"
                onClick={() => handleSwitchMode('login')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                id="tab-signup"
                type="button"
                onClick={() => handleSwitchMode('signup')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-slate-900">Reset Password</h2>
              <button
                id="btn-back-to-login"
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Back to Sign In
              </button>
            </div>
          )}

          {/* Error Banner */}
          {activeError && (
            <div 
              id="auth-error-banner"
              className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-normal">{activeError}</div>
            </div>
          )}

          {/* Success Banner for Password Reset */}
          {resetSent && (
            <div 
              id="reset-success-banner"
              className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-normal">
                Check your inbox! We sent a password reset link to <strong>{email}</strong>.
              </div>
            </div>
          )}

          {/* Google Sign-in Button */}
          {mode !== 'forgot' && (
            <>
              <button
                id="btn-google-signin"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-2xs disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400 font-medium">Or continue with email</span>
                </div>
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="auth-name-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-name-input"
                    type="text"
                    required
                    placeholder="Alex Johnson"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="auth-email-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  placeholder="student@example.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="auth-password-input" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      id="btn-forgot-password-link"
                      type="button"
                      onClick={() => handleSwitchMode('forgot')}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-password-input"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                  />
                </div>
                {mode === 'signup' && (
                  <p className="mt-1 text-[11px] text-slate-400">
                    Must be at least 6 characters.
                  </p>
                )}
              </div>
            )}

            <button
              id="btn-auth-submit"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <span>
                {isLoading
                  ? 'Please wait...'
                  : mode === 'login'
                  ? 'Sign In to Workspace'
                  : mode === 'signup'
                  ? 'Start Free Workspace'
                  : 'Send Reset Link'}
              </span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Security note */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Private & isolated student database • 256-bit encrypted</span>
          </div>
        </div>

        {/* Feature Cards Below Auth */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-white/70 backdrop-blur-xs border border-slate-200/60 rounded-2xl shadow-2xs">
            <Target className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
            <div className="text-xs font-bold text-slate-800">Smart Tasks</div>
            <div className="text-[10px] text-slate-500">Organize by subject</div>
          </div>
          <div className="p-3 bg-white/70 backdrop-blur-xs border border-slate-200/60 rounded-2xl shadow-2xs">
            <Clock className="w-4 h-4 text-amber-600 mx-auto mb-1" />
            <div className="text-xs font-bold text-slate-800">Focus Timer</div>
            <div className="text-[10px] text-slate-500">Pomodoro & deep work</div>
          </div>
          <div className="p-3 bg-white/70 backdrop-blur-xs border border-slate-200/60 rounded-2xl shadow-2xs">
            <Compass className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
            <div className="text-xs font-bold text-slate-800">Daily Streak</div>
            <div className="text-[10px] text-slate-500">Track study goals</div>
          </div>
        </div>
      </div>
    </div>
  );
};
