import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface ResetPasswordProps {
  onSuccess?: () => void;
}

export function ResetPassword({ onSuccess }: ResetPasswordProps) {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    setToken(t);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) return setError('Reset token not provided.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    setLoading(true);
    try {
      const data: any = await api.post('/api/auth/reset-password', { token, newPassword: password });
      if (!data) throw new Error('Invalid response from server');

      setSuccess(true);
      // optional navigation after success
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-4">Invalid reset link</h2>
          <p className="text-sm text-neutral-600">The password reset link is missing or invalid. Please request a new reset link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow">
        {!success ? (
          <>
            <h2 className="text-2xl font-semibold mb-4">Create a new password</h2>
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none"
                minLength={6}
                required
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none"
                minLength={6}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-70"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Password reset successful</h3>
            <p className="text-sm text-neutral-600 mb-4">You can now log in with your new password.</p>
            <button
              onClick={() => onSuccess ? onSuccess() : window.location.href = '/'}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
