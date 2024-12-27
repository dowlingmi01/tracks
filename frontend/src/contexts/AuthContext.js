// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { loginUser, registerUser } from '../services/auth';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize user state from localStorage
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    try {
      const response = await loginUser(credentials.email, credentials.password);
      console.log('Login response:', response);
      
      if (response.user) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const isSuperAdmin = useCallback(() => {
    return user?.role === 'SUPERADMIN';
  }, [user]);

  const isAdmin = useCallback(() => {
    return user?.role === 'ADMIN';
  }, []);

  // Initialize auth state
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        logout();
      }
    }
    setLoading(false);
  }, [logout]);

  // Debug user state changes
  useEffect(() => {
    console.log('User state updated:', user);
    console.log('Is SuperAdmin:', user?.role === 'SUPERADMIN');
  }, [user]);

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isSuperAdmin,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;