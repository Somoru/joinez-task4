import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/api';

// Create context
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.getMe();
        setUser(response.data.data.user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Register new user
  const register = async (username, password, role) => {
    try {
      setError(null);
      const response = await authAPI.register({ username, password, role });
      const { token, data } = response.data;
      
      localStorage.setItem('token', token);
      setUser(data.user);
      setIsAuthenticated(true);
      
      return data.user;
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  // Login user
  const login = async (username, password) => {
    try {
      setError(null);
      const response = await authAPI.login({ username, password });
      const { token, data } = response.data;
      
      localStorage.setItem('token', token);
      setUser(data.user);
      setIsAuthenticated(true);
      
      return data.user;
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};