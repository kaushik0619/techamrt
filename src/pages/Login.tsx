import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus, Loader2, ArrowLeft, Mail } from 'lucide-react';

interface LoginProps {
  onSuccess: () => void;
}

export function Login({ onSuccess }: LoginProps) {
  // View State
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Common State
  const [loading, setLoading] = useState<'login' | 'register' | 'forgot' | null>(null);
  const [error, setError] = useState<{ type: 'login' | 'register' | 'forgot', message: string } | null>(null);

  const { login, register, resetPassword } = useAuth();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading('login');
    try {
      await login(loginEmail, loginPassword);
      onSuccess();
    } catch (err: any) {
      setError({ type: 'login', message: err.message || 'Invalid email or password.' });
    } finally {
      setLoading(null);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      setError({ type: 'register', message: 'Passwords do not match.' });
      return;
    }
    setError(null);
    setLoading('register');
    try {
      await register(regFullName, regEmail, regPassword);
      onSuccess();
    } catch (err: any) {
      setError({ type: 'register', message: err.message || 'Could not create account.' });
    } finally {
      setLoading(null);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading('forgot');
    try {
      await resetPassword(forgotEmail);
      setResetSent(true);
    } catch (err: any) {
      setError({ type: 'forgot', message: err.message || 'Could not send reset email.' });
    } finally {
      setLoading(null);
    }
  }

  function handleBackToLogin() {
    setView('login');
    setResetSent(false);
    setForgotEmail('');
    setError(null);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <img src="/login-logo.png" alt="Logo" className="h-40 mb-4" />
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Welcome to Accessories but cheaper</h1>
        <p className="text-gray-600 text-sm sm:text-base">Your one-stop shop for electronics and accessories.</p>
      </div>

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-12">
        {view === 'forgot' ? (
          // Forgot Password View
          <div className="max-w-md mx-auto space-y-6">
            <button
              onClick={handleBackToLogin}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>

            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Reset Password</h2>
              <p className="text-gray-600 text-sm">
                {resetSent
                  ? "Check your email for reset instructions"
                  : "Enter your email address and we'll send you a link to reset your password"}
              </p>
            </div>

            {resetSent ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-green-800 font-medium">Email sent!</p>
                    <p className="text-green-700 text-sm">Check your inbox for password reset instructions.</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {error && error.type === 'forgot' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error.message}
                  </div>
                )}
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label htmlFor="forgot-email" className="sr-only">Email address</label>
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Email address"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading === 'forgot'}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                  >
                    {loading === 'forgot' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                    <span>Send Reset Link</span>
                  </button>
                </form>
              </>
            )}
          </div>
        ) : (
          // Login and Register View
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Login Form */}
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Login</h2>
              {error && error.type === 'login' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error.message}
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="sr-only">Email address</label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label htmlFor="login-password" className="sr-only">Password</label>
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Password"
                  />
                </div>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading === 'login'}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                >
                  {loading === 'login' ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                  <span>Login</span>
                </button>
              </form>
            </div>

            {/* Create Account Form */}
            <div className="space-y-6 pt-8 md:pt-0 border-t md:border-t-0 md:border-l md:pl-8 border-gray-200">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Create an Account</h2>
              {error && error.type === 'register' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error.message}
                </div>
              )}
              <form onSubmit={handleRegister} className="space-y-4">
                <input type="text" required value={regFullName} onChange={(e) => setRegFullName(e.target.value)} className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Full Name" />
                <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Email address" />
                <input type="password" required minLength={6} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Password" />
                <input type="password" required minLength={6} value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Confirm Password" />
                <button
                  type="submit"
                  disabled={loading === 'register'}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                >
                  {loading === 'register' ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                  <span>Register</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}