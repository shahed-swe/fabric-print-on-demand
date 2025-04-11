import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../config/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      validateToken();
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async () => {
    try {
      const response = await axios.get('/api/admin/validate-token');
      setUser(response.data);
    } catch (error) {
      console.error('Token validation failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/admin/auth/login', { email, password });
      const { token } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('adminToken', token);
      
      // Set authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch user data with the token to ensure we have the latest data
      const userResponse = await axios.get('/api/admin/validate-token');
      const userData = userResponse.data;
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Explicitly compute isAuthenticated from user state
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        login, 
        logout, 
        isAuthenticated, 
        loading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
