import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import axios from '../config/axios';
import { FaLock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

export default function ResetPassword() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      const queryToken = router.query.token as string;
      if (queryToken) {
        setToken(queryToken);
        // Token is provided in URL, we'll validate it on submit
        setTokenValid(true);
        setValidating(false);
      } else {
        setError('No reset token provided');
        setValidating(false);
      }
    }
  }, [router.isReady, router.query.token]);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axios.post(`/auth/reset-password/${token}`, {
        password,
        confirmPassword
      });

      setSuccess(true);
      setPassword('');
      setConfirmPassword('');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
      if (err.response?.data?.message === 'Invalid or expired reset token') {
        setTokenValid(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying reset link...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!tokenValid) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-xl p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaExclamationCircle className="text-3xl text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h1>
              <p className="text-gray-600 mb-6">
                The password reset link is invalid or has expired. Reset links expire after 1 hour.
              </p>
              <Link href="/forgot-password">
                <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition duration-200">
                  Request New Reset Link
                </button>
              </Link>
              <p className="text-gray-600 text-sm mt-4">
                Remember your password?{' '}
                <Link href="/login">
                  <span className="text-purple-600 hover:text-purple-700 font-semibold cursor-pointer">
                    Sign in
                  </span>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Main Card */}
          <div className="bg-white rounded-lg shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaLock className="text-3xl text-purple-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
              <p className="text-gray-600">Enter your new password below</p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start">
                <FaCheckCircle className="text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-700 font-medium">Password reset successful!</p>
                  <p className="text-green-600 text-sm mt-1">
                    Redirecting you to login... You can now sign in with your new password.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start">
                <FaExclamationCircle className="text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-700 font-medium">Error</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Form */}
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Password must be at least 6 characters long
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                    disabled={loading}
                  />
                  {password && confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-600 mt-2">Passwords do not match</p>
                  )}
                  {password && confirmPassword && password === confirmPassword && (
                    <p className="text-xs text-green-600 mt-2">✓ Passwords match</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>

                {/* Password Requirements */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Password Requirements:</p>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li className={password.length >= 6 ? 'text-green-600' : ''}>
                      ✓ At least 6 characters
                    </li>
                    <li className={password === confirmPassword && password ? 'text-green-600' : ''}>
                      ✓ Passwords match
                    </li>
                  </ul>
                </div>
              </form>
            ) : null}

            {/* Back to Login Link */}
            {!success && (
              <p className="text-center text-gray-600 text-sm mt-6">
                Remember your password?{' '}
                <Link href="/login">
                  <span className="text-purple-600 hover:text-purple-700 font-semibold cursor-pointer">
                    Sign in
                  </span>
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
