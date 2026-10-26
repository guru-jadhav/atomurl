import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroShortener from './components/HeroShortener';
import Dashboard from './components/Dashboard';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfileModal from './components/ProfileModal';
import AuthModal from './components/AuthModal';
import AuthCallback from './pages/AuthCallback';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('shortener');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [analyticsCode, setAnalyticsCode] = useState(null);
  const [toast, setToast] = useState(null);

  // Manage auth callback mode in state so it cleanly unmounts after token extraction
  const [isAuthCallback, setIsAuthCallback] = useState(() => 
    window.location.pathname.startsWith('/auth/callback') || window.location.search.includes('token=')
  );

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleCallbackFinish = (msg, type = 'info') => {
    window.history.replaceState({}, document.title, '/');
    setIsAuthCallback(false);
    showToast(msg, type);
    setActiveTab('dashboard');
  };

  return (
    <div>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      <main className="app-container">
        {isAuthCallback ? (
          <AuthCallback onFinish={handleCallbackFinish} />
        ) : (
          <div key={activeTab} className="page-fade-in">
            {activeTab === 'shortener' && (
              <HeroShortener
                onShowToast={showToast}
                onUrlCreated={() => {}}
                onViewAnalytics={(code) => {
                  setAnalyticsCode(code);
                  setActiveTab('analytics');
                }}
              />
            )}

            {activeTab === 'dashboard' && (
              isAuthenticated ? (
                <Dashboard
                  onShowToast={showToast}
                  onViewAnalytics={(code) => {
                    setAnalyticsCode(code);
                    setActiveTab('analytics');
                  }}
                />
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '64px', maxWidth: '480px', margin: '48px auto' }}>
                  <h3 style={{ marginBottom: '8px' }}>Sign in to view Dashboard</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                    Access and manage all your shortened links and click analytics.
                  </p>
                  <button className="btn btn-primary" onClick={() => setShowAuthModal(true)}>
                    Sign In
                  </button>
                </div>
              )
            )}

            {activeTab === 'analytics' && (
              <AnalyticsPage
                initialShortCode={analyticsCode}
                onShowToast={showToast}
              />
            )}
          </div>
        )}
      </main>

      {/* Floating Modals */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} onShowToast={showToast} />
      )}

      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} onShowToast={showToast} />
      )}



      {/* Toast Notification */}
      {toast && (
        <div className="toast-container">
          <div className="toast" style={{ borderColor: toast.type === 'error' ? 'var(--danger)' : 'var(--border)' }}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
