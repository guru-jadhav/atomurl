import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function getJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const payload = getJwtPayload(token);
  if (!payload || !payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('atom_token');
    if (!stored || isTokenExpired(stored)) {
      localStorage.removeItem('atom_token');
      const lastScreen = localStorage.getItem('atom_last_screen');
      if (lastScreen === 'dashboard' || lastScreen === 'admin') {
        localStorage.setItem('atom_last_screen', 'shortener');
      }
      return null;
    }
    return stored;
  });
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

  // Global listener for API 401s (token revoked or expired during session)
  useEffect(() => {
    const handleAuthExpired = () => {
      logout();
    };
    window.addEventListener('atom_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('atom_auth_expired', handleAuthExpired);
  }, []);

  // Fetch user profile if token exists
  useEffect(() => {
    if (token) {
      if (isTokenExpired(token)) {
        logout();
        return;
      }
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
    localStorage.setItem('atom_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('atom_token');
    const lastScreen = localStorage.getItem('atom_last_screen');
    if (lastScreen === 'dashboard' || lastScreen === 'admin') {
      localStorage.setItem('atom_last_screen', 'shortener');
    }
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
