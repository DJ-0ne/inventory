// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getSidebarData } from '../layout/sidebardata/sidebarData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    console.log('🔐 Loading user data from localStorage:', userData);
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        console.log('✅ User loaded:', parsed);
        setUser(parsed);
      } catch (e) {
        console.error('❌ Error parsing user data:', e);
        localStorage.removeItem('userData');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    console.log('🔐 Logging in user:', userData);
    localStorage.setItem('authToken', userData.token || 'mock-token');
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    console.log('🔐 Logging out');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  const getMenu = () => {
    if (!user) {
      console.log('⚠️ No user, returning empty menu');
      return [];
    }
    console.log(`📋 Getting menu for role: ${user.role}`);
    const menu = getSidebarData(user.role);
    console.log('📋 Menu items:', menu.map(item => item.title));
    return menu;
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