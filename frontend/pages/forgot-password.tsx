import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import axios from '../config/axios';
import { FaArrowLeft, FaEnvelope } from 'react-icons/fa';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      const response = await axios.post('/auth/forgot-password', { email });
      
      setSuccess(true);
      setEmail('');
      
      // Keep the success message for 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Back to Login Link */}
          <Link href="/login">
            <div className="flex items-center text-purple-600 hover:text-purple-700 mb-8 cursor-pointer">
              <FaArrowLeft className="mr-2" />
              <span>Back to Login</span>
            </div>
          </Link>

          {/* Main Card */}
          <div className="bg-white rounded-lg shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaEnvelope className="text-3xl text-purple-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
              <p className="text-gray-600">Enter your email address and we'll send you a link to reset your password.</p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                <p className="text-green-700 font-medium">✓ Reset link sent!</p>
                <p className="text-green-600 text-sm mt-1">
                  Check your email for the password reset link. The link will expire in 1 hour.
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <p className="text-red-700 font-medium">✗ Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            )}

            {/* Form */}
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    We'll send a password reset link to this email address.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>

                <p className="text-center text-gray-600">
                  Remember your password?{' '}
                  <Link href="/login">
                    <span className="text-purple-600 hover:text-purple-700 font-semibold cursor-pointer">
                      Sign in
                    </span>
                  </Link>
                </p>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-900 text-sm leading-relaxed">
                    We've sent a password reset link to <strong>{email}</strong>. 
                    Check your inbox and click the link to reset your password. 
                    The link will expire in 1 hour.
                  </p>
                </div>
                <button
                  onClick={() => setSuccess(false)}
                  className="text-purple-600 hover:text-purple-700 font-semibold underline"
                >
                  Send another email
                </button>
                <p className="text-gray-600 text-sm">
                  Didn't receive the email? Check your spam folder or{' '}
                  <Link href="/login">
                    <span className="text-purple-600 hover:text-purple-700 font-semibold cursor-pointer">
                      try again
                    </span>
                  </Link>
                </p>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              For security reasons, password reset links expire after 1 hour.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
