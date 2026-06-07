import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true;
  });

  // Get API base URL from environment or use default
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token and get user data
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const verifyToken = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/profile`);
      setUser(response.data.user);
    } catch (error) {
      console.error('Token verification failed:', error.response?.data?.message || error.message);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
        identifier,
        password,
      });
      
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.details?.[0]?.message || 'Login failed. Please try again.';
      return { 
        success: false, 
        message,
        details: error.response?.data?.details
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/auth/signup`, userData);
      
      const { token, user: newUser } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(newUser);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.details?.[0]?.message || 'Signup failed. Please try again.';
      return { 
        success: false, 
        message,
        details: error.response?.data?.details
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    darkMode,
    toggleDarkMode,
    API_BASE_URL,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
