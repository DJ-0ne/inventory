// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getSidebarData } from '../layout/sidebardata/sidebarData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem('userData');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('authToken', userData.token || 'mock-token');
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    // Clear cookies if any
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    setUser(null);
  };

  const getMenu = () => {
    if (!user) return [];
    return getSidebarData(user.role);
  };

  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      loading,
      getMenu,
      hasRole,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};