import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('atom_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('atom_theme') || 'dark');

  // Theme synchronization
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('atom_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Fetch user profile if token exists
  useEffect(() => {
    if (token) {
      localStorage.setItem('atom_token', token);
      api.getUserProfile()
        .then(res => setUser(res.data))
        .catch(() => {
          // Token expired or invalid
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      localStorage.removeItem('atom_token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const loginWithToken = (newToken) => {
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('atom_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const res = await api.getUserProfile();
        setUser(res.data);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      token,
      user,
      loading,
      theme,
      toggleTheme,
      loginWithToken,
      logout,
      refreshUser,
      isAuthenticated: !!token && !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
