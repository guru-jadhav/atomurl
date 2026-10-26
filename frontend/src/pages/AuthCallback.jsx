import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback({ onFinish }) {
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (token) {
      loginWithToken(token);
      // Clean path and params back to root '/'
      window.history.replaceState({}, document.title, '/');
      onFinish('Successfully signed in via OAuth!');
    } else if (error) {
      window.history.replaceState({}, document.title, '/');
      onFinish('Authentication cancelled or failed', 'error');
    } else {
      window.history.replaceState({}, document.title, '/');
      onFinish('Missing authentication token', 'error');
    }
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
      Verifying authentication...
    </div>
  );
}
