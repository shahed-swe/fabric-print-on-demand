import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import axios from '@/config/axios';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function VerifyEmail() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = router.query.token as string;

        if (!token) {
          setError('No verification token provided');
          setVerifying(false);
          return;
        }

        const response = await axios.get(`/auth/verify/${token}`);

        setSuccess(true);
        setError('');
        setVerifying(false);
        toast.success('Email verified successfully!');

        // Update user context if available
        if (user) {
          updateUser({ ...user, isVerified: true });
        }

        // Redirect to profile or home after 3 seconds
        setTimeout(() => {
          router.push('/profile');
        }, 3000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to verify email');
        setVerifying(false);
        toast.error('Verification failed. Token may be expired.');
      }
    };

    if (router.isReady) {
      verifyToken();
    }
  }, [router.isReady, router.query.token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {verifying ? (
          <>
            <div className="mb-6 flex justify-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin"></div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email</h1>
            <p className="text-gray-600">Please wait while we verify your email address...</p>
          </>
        ) : success ? (
          <>
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
            <p className="text-gray-600 mb-6">
              Your email has been successfully verified. You now have full access to all features.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                ✓ Email verified and confirmed
              </p>
              <p className="text-sm text-green-800">
                ✓ Full account access enabled
              </p>
              <p className="text-sm text-green-800">
                ✓ You can now use all features
              </p>
            </div>
            <p className="text-gray-600 text-sm">
              Redirecting to your profile in 3 seconds...
            </p>
            <Link
              href="/profile"
              className="inline-block mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go to Profile
            </Link>
          </>
        ) : (
          <>
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                The verification token is invalid or has expired. Please request a new verification email.
              </p>
            </div>
            <div className="space-y-3">
              <Link
                href="/profile"
                className="inline-block w-full px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Go to Profile
              </Link>
              <Link
                href="/"
                className="inline-block w-full px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go Home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
