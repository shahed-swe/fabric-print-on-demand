import axios, { AxiosError } from 'axios';
import { compressImageWithDimensions } from '../utils/imageCompressor';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const getHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  'Content-Type': 'application/json',
});

interface ErrorResponse {
  message?: string;
  error?: string;
}

export const profileService = {
  getProfile: async () => {
    try {
      const response = await axios.get(`${API_URL}/profile`, {
        headers: getHeaders(),
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw axiosError.response?.data || { message: 'Failed to fetch profile' };
    }
  },

  checkEmailExists: async (email: string) => {
    try {
      const response = await axios.post(
        `${API_URL}/profile/check-email`,
        { email },
        {
          headers: getHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw axiosError.response?.data || { message: 'Failed to check email' };
    }
  },

  updateProfile: async (data: { name: string; email: string }) => {
    try {
      const response = await axios.put(`${API_URL}/profile`, data, {
        headers: getHeaders(),
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw axiosError.response?.data || { message: 'Failed to update profile' };
    }
  },

  updatePassword: async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      const response = await axios.put(`${API_URL}/profile/password`, data, {
        headers: getHeaders(),
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw axiosError.response?.data || { message: 'Failed to update password' };
    }
  },

  uploadProfilePicture: async (file: File) => {
    try {
      // Compress the image to max 2MB
      const compressedFile = await compressImageWithDimensions(file, 2);

      const formData = new FormData();
      formData.append('file', compressedFile);

      const response = await axios.post(
        `${API_URL}/profile/picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            // Don't set Content-Type - let FormData handle it
          },
        }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw axiosError.response?.data || { message: 'Failed to upload profile picture' };
    }
  },
};
