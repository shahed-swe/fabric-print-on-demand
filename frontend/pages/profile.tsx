import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profile';
import { orderService } from '../services/order';
import axios from '../config/axios';
import { FaCamera, FaLock, FaUser, FaShoppingBag, FaArrowRight, FaEnvelope, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';

interface ProfileData {
  _id: string;
  name: string;
  email: string;
  type: string;
  profilePicture: string | null;
  isVerified?: boolean;
  createdAt: string;
}

interface FormErrors {
  [key: string]: string;
}

interface Order {
  _id: string;
  orderNumber?: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items?: any[];
}

const Profile = () => {
  const router = useRouter();
  const { isAuthenticated, user, login, isLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Edit Profile States
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
  });
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [editLoading, setEditLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Password Change States
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<FormErrors>({});
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Email Verification States
  const [resendingVerification, setResendingVerification] = useState(false);

  // Profile Picture States
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Orders States
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    // Wait for AuthContext to finish loading
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchProfile();
  }, [isAuthenticated, router, isLoading]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
      setEditFormData({
        name: data.name,
        email: data.email,
      });
      setError('');
      fetchOrders();
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const data = await orderService.getOrders();
      
      if (Array.isArray(data)) {
        // Filter orders for current user
        const userOrders = data.filter((order: any) => 
          order.userId === user?._id || (order.user && order.user._id === user?._id)
        );
        // Sort by creation date (most recent first) and get only the first 3 orders
        const sortedOrders = userOrders.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedOrders.slice(0, 3));
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      console.error('Failed to load orders:', err);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const validateEditForm = () => {
    const errors: FormErrors = {};

    if (!editFormData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!editFormData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      errors.email = 'Please enter a valid email';
    }

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailBlur = async () => {
    // Only check email if it's different from the original and valid format
    if (
      editFormData.email &&
      profile?.email !== editFormData.email &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)
    ) {
      try {
        setCheckingEmail(true);
        const result = await profileService.checkEmailExists(editFormData.email);
        
        if (result.exists) {
          setEditErrors((prev) => ({
            ...prev,
            email: 'This email already has an account',
          }));
        } else {
          // Clear email error if it was about existence
          setEditErrors((prev) => {
            const newErrors = { ...prev };
            if (newErrors.email === 'This email already has an account') {
              delete newErrors.email;
            }
            return newErrors;
          });
        }
      } catch (err: any) {
        console.error('Email check failed:', err);
      } finally {
        setCheckingEmail(false);
      }
    }
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEditForm()) {
      return;
    }

    try {
      setEditLoading(true);
      setError('');
      setSuccessMessage('');

      const response = await profileService.updateProfile(editFormData);

      // Update the profile state
      setProfile((prev) =>
        prev ? { ...prev, name: editFormData.name, email: editFormData.email } : null
      );

      // Update auth context
      if (user && 'name' in user) {
        login(localStorage.getItem('token')!, {
          ...user,
          name: editFormData.name,
          email: editFormData.email,
        });
      }

      setSuccessMessage(response.message || 'Profile updated successfully');
      setEditMode(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  const validatePasswordForm = () => {
    const errors: FormErrors = {};

    if (!passwordFormData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordFormData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordFormData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordFormData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    try {
      setPasswordLoading(true);
      setError('');
      setSuccessMessage('');

      await profileService.updatePassword(passwordFormData);

      setSuccessMessage('Password updated successfully');
      setPasswordFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors({});
      setShowPasswordForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setResendingVerification(true);
      setError('');
      setSuccessMessage('');

      const response = await axios.post('/auth/resend-verification');

      setSuccessMessage('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send verification email');
    } finally {
      setResendingVerification(false);
    }
  };

  const handlePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    try {
      setUploadingPicture(true);
      setError('');
      setSuccessMessage('');

      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file (compression happens in the service)
      const response = await profileService.uploadProfilePicture(file);

      // Update profile
      setProfile((prev) =>
        prev ? { ...prev, profilePicture: response.profilePicture } : null
      );

      setSuccessMessage('Profile picture updated successfully');
      setPreviewUrl(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload profile picture');
      setPreviewUrl(null);
    } finally {
      setUploadingPicture(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading || isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-orange-500"></div>
            <p className="text-gray-600 font-medium">Loading your profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your account information and preferences</p>
          </div>

          {/* Email Verification Banner */}
          {profile && !profile.isVerified && (
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg flex items-start justify-between">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0zM8 9a1 1 0 100-2 1 1 0 000 2zm5-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-semibold text-blue-900">Email Not Verified</h3>
                  <p className="text-sm text-blue-800 mt-1">
                    Please verify your email address to unlock all features and ensure you receive important account notifications.
                  </p>
                </div>
              </div>
              <button
                onClick={handleResendVerification}
                disabled={resendingVerification}
                className="ml-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm font-medium flex-shrink-0 whitespace-nowrap"
              >
                {resendingVerification ? 'Sending...' : 'Send Verification Email'}
              </button>
            </div>
          )}

          {/* Alert Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 flex items-center">
              <svg className="h-5 w-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg text-green-700 flex items-center">
              <FaCheck className="h-5 w-5 mr-3 flex-shrink-0" />
              {successMessage}
            </div>
          )}

          {profile && (
            <>
              {/* Profile Picture & Basic Info Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex flex-col sm:flex-row items-start gap-8">
                  {/* Profile Picture */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      {previewUrl || profile.profilePicture ? (
                        <img
                          src={previewUrl || profile.profilePicture || ''}
                          alt="Profile"
                          className="h-40 w-40 rounded-2xl object-cover border-4 border-orange-200 shadow-lg"
                        />
                      ) : (
                        <div className="h-40 w-40 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center border-4 border-orange-200 shadow-lg">
                          <FaUser className="text-orange-400 text-6xl" />
                        </div>
                      )}
                      <button
                        onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                        disabled={uploadingPicture}
                        className="absolute bottom-2 right-2 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg transition-all transform hover:scale-110 disabled:opacity-50"
                        title="Upload picture"
                      >
                        <FaCamera className="text-lg" />
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePictureChange}
                        disabled={uploadingPicture}
                        className="hidden"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-4 text-center">JPG, PNG, GIF (max 2MB)</p>
                    {uploadingPicture && <p className="text-xs text-orange-500 mt-2 text-center font-medium">Uploading...</p>}
                  </div>

                  {/* User Info */}
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900">{profile.name}</h2>
                        <p className="text-gray-600 flex items-center mt-2">
                          <FaEnvelope className="mr-2 text-orange-500 text-sm" />
                          {profile.email}
                        </p>
                      </div>
                      {!editMode && (
                        <button
                          onClick={() => setEditMode(true)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit profile"
                        >
                          <FaEdit className="text-orange-500 text-xl" />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <span className="px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-800 rounded-full text-sm font-medium border border-orange-200">
                        {profile.type || 'User'}
                      </span>
                      <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                        📅 Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Profile Form */}
              {editMode && (
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <FaEdit className="mr-3 text-orange-500" />
                    Edit Profile
                  </h3>
                  <form onSubmit={handleEditProfile} className="space-y-6">
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                          editErrors.name
                            ? 'border-red-500 focus:border-red-600 bg-red-50'
                            : 'border-gray-300 focus:border-orange-500 bg-white'
                        }`}
                        placeholder="Enter your full name"
                      />
                      {editErrors.name && <p className="text-red-600 text-sm mt-1">{editErrors.name}</p>}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        onBlur={handleEmailBlur}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                          editErrors.email
                            ? 'border-red-500 focus:border-red-600 bg-red-50'
                            : 'border-gray-300 focus:border-orange-500 bg-white'
                        }`}
                        placeholder="Enter your email"
                      />
                      {editErrors.email && <p className="text-red-600 text-sm mt-1">{editErrors.email}</p>}
                      {checkingEmail && <p className="text-blue-600 text-sm mt-1">Checking email availability...</p>}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={editLoading}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 flex items-center justify-center"
                      >
                        <FaCheck className="mr-2" />
                        {editLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditMode(false);
                          setEditFormData({ name: profile.name, email: profile.email });
                          setEditErrors({});
                        }}
                        className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors flex items-center justify-center"
                      >
                        <FaTimes className="mr-2" />
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Change Password Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FaLock className="mr-3 text-orange-500" />
                    Security
                  </h3>
                  {!showPasswordForm && (
                    <button
                      onClick={() => setShowPasswordForm(true)}
                      className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-all transform hover:scale-105"
                    >
                      Change Password
                    </button>
                  )}
                </div>

                {showPasswordForm && (
                  <form onSubmit={handlePasswordChange} className="space-y-5">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <input
                        type="password"
                        value={passwordFormData.currentPassword}
                        onChange={(e) => setPasswordFormData({ ...passwordFormData, currentPassword: e.target.value })}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                          passwordErrors.currentPassword
                            ? 'border-red-500 focus:border-red-600 bg-red-50'
                            : 'border-gray-300 focus:border-orange-500 bg-white'
                        }`}
                        placeholder="Enter your current password"
                      />
                      {passwordErrors.currentPassword && <p className="text-red-600 text-sm mt-1">{passwordErrors.currentPassword}</p>}
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        value={passwordFormData.newPassword}
                        onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                          passwordErrors.newPassword
                            ? 'border-red-500 focus:border-red-600 bg-red-50'
                            : 'border-gray-300 focus:border-orange-500 bg-white'
                        }`}
                        placeholder="Enter your new password"
                      />
                      {passwordErrors.newPassword && <p className="text-red-600 text-sm mt-1">{passwordErrors.newPassword}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordFormData.confirmPassword}
                        onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                          passwordErrors.confirmPassword
                            ? 'border-red-500 focus:border-red-600 bg-red-50'
                            : 'border-gray-300 focus:border-orange-500 bg-white'
                        }`}
                        placeholder="Confirm your new password"
                      />
                      {passwordErrors.confirmPassword && <p className="text-red-600 text-sm mt-1">{passwordErrors.confirmPassword}</p>}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 flex items-center justify-center"
                      >
                        <FaLock className="mr-2" />
                        {passwordLoading ? 'Updating...' : 'Update Password'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                          setPasswordErrors({});
                        }}
                        className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors flex items-center justify-center"
                      >
                        <FaTimes className="mr-2" />
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {!showPasswordForm && (
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      Keep your account secure by changing your password regularly. Use a strong password with a mix of uppercase, lowercase, numbers, and special characters.
                    </p>
                  </div>
                )}
              </div>

              {/* Recent Orders Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FaShoppingBag className="mr-3 text-orange-500" />
                    Recent Orders
                  </h3>
                  <Link href="/orders" className="flex items-center text-orange-500 hover:text-orange-600 font-medium transition-colors">
                    <>View All <FaArrowRight className="ml-2" /></>
                  </Link>
                </div>

                {ordersLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-orange-500"></div>
                    <p className="text-gray-600 mt-3">Loading orders...</p>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Link key={order._id} href={`/orders#order-${order._id}`} className="block p-5 border-2 border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all group cursor-pointer">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                                <FaShoppingBag className="text-orange-500" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">Order #{order._id.slice(-8)}</p>
                                <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                            <div>
                              <p className="text-sm text-gray-600">Amount</p>
                              <p className="font-bold text-lg text-gray-900">৳{order.totalAmount.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                                order.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : order.status === 'processing'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                              <FaArrowRight className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaShoppingBag className="mx-auto text-4xl text-gray-300 mb-4" />
                    <p className="text-gray-600 mb-2">No orders yet</p>
                    <Link href="/products" className="text-orange-500 hover:text-orange-600 font-medium">
                      Start shopping
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
