import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import HeroShortener from './components/HeroShortener';
import Dashboard from './components/Dashboard';
import AnalyticsPage from './pages/AnalyticsPage';
import AdminPage from './pages/AdminPage';
import ProfileModal from './components/ProfileModal';
import Footer from './components/Footer';
import AboutModal from './components/AboutModal';
import AuthModal from './components/AuthModal';
import AuthCallback from './pages/AuthCallback';
import { useAuth, isTokenExpired, getJwtPayload } from './context/AuthContext';

const LAST_SCREEN_KEY = 'atom_last_screen';
const VALID_TABS = ['shortener', 'dashboard', 'analytics', 'admin'];

export default function App() {
  const { isAuthenticated, user, loading, token } = useAuth();
  
  // Initialize from localStorage if valid; fallback to 'shortener' for guests
  const [activeTab, setActiveTab] = useState(() => {
    const storedToken = localStorage.getItem('atom_token');
    const hasValidToken = storedToken && !isTokenExpired(storedToken);
    const saved = localStorage.getItem(LAST_SCREEN_KEY);

    // Guests can only land on 'shortener' or 'analytics'
    if (!hasValidToken) {
      if (saved === 'analytics') return 'analytics';
      return 'shortener';
    }

    // Authenticated non-admins cannot land on 'admin'
    const payload = getJwtPayload(storedToken);
    if (saved === 'admin' && !payload?.isAdmin) {
      return 'dashboard';
    }

    if (saved && VALID_TABS.includes(saved)) {
      return saved;
    }
    return 'shortener';
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [analyticsCode, setAnalyticsCode] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState(null);

  // Guard protected tabs: redirect guests to 'shortener' and non-admins to 'dashboard'
  useEffect(() => {
    if (!isAuthenticated) {
      if (activeTab === 'dashboard' || activeTab === 'admin') {
        setActiveTab('shortener');
      }
    } else if (!user?.isAdmin && activeTab === 'admin') {
      setActiveTab('dashboard');
    }
  }, [isAuthenticated, user?.isAdmin, activeTab]);

  // Persist activeTab to localStorage (only persist tabs the user is permitted to visit)
  useEffect(() => {
    if (activeTab && VALID_TABS.includes(activeTab)) {
      if (!isAuthenticated && (activeTab === 'dashboard' || activeTab === 'admin')) {
        localStorage.setItem(LAST_SCREEN_KEY, 'shortener');
      } else if (!user?.isAdmin && activeTab === 'admin') {
        localStorage.setItem(LAST_SCREEN_KEY, 'dashboard');
      } else {
        localStorage.setItem(LAST_SCREEN_KEY, activeTab);
      }
    }
  }, [activeTab, isAuthenticated, user?.isAdmin]);

  // Resolve target tab after login: saved last screen or default to 'dashboard'
  const resolvePostLoginScreen = () => {
    const saved = localStorage.getItem(LAST_SCREEN_KEY);
    const storedToken = localStorage.getItem('atom_token');
    const payload = getJwtPayload(storedToken);
    const isAdminUser = Boolean(payload?.isAdmin ?? user?.isAdmin);

    if (saved === 'admin' && !isAdminUser) {
      return 'dashboard';
    }

    if (saved && VALID_TABS.includes(saved)) {
      return saved;
    }
    return 'dashboard';
  };

  // Manage auth callback mode in state so it cleanly unmounts after token extraction
  const [isAuthCallback, setIsAuthCallback] = useState(() => 
    window.location.pathname.startsWith('/auth/callback') || window.location.search.includes('token=')
  );

  const toastTimerRef = useRef(null);
  const showToast = useCallback((message, type = 'info') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  const handleCallbackFinish = (msg, type = 'info') => {
    window.history.replaceState({}, document.title, '/');
    setIsAuthCallback(false);
    showToast(msg, type);
    const targetScreen = resolvePostLoginScreen();
    setActiveTab(targetScreen);
  };

  return (
    <div className="app-layout">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      <main className="app-container" style={{ flex: 1 }}>
        {isAuthCallback ? (
          <AuthCallback onFinish={handleCallbackFinish} />
        ) : (
          <>
            <div style={{ display: activeTab === 'shortener' ? 'block' : 'none' }}>
              <HeroShortener
                onShowToast={showToast}
                onUrlCreated={() => setRefreshKey(prev => prev + 1)}
                onViewAnalytics={(code) => {
                  setAnalyticsCode(code);
                  setActiveTab('analytics');
                }}
              />
            </div>

            {activeTab === 'dashboard' && isAuthenticated && (
              <Dashboard
                key={refreshKey}
                onShowToast={showToast}
                onViewAnalytics={(code) => {
                  setAnalyticsCode(code);
                  setActiveTab('analytics');
                }}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsPage
                initialShortCode={analyticsCode}
                onShowToast={showToast}
                onViewDashboard={() => setActiveTab('dashboard')}
              />
            )}

            {activeTab === 'admin' && user?.isAdmin && (
              <AdminPage onShowToast={showToast} />
            )}
          </>
        )}
      </main>

      <Footer onOpenAbout={() => setShowAboutModal(true)} />

      {/* Floating Modals */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            const targetScreen = resolvePostLoginScreen();
            setActiveTab(targetScreen);
          }}
          onShowToast={showToast}
        />
      )}

      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} onShowToast={showToast} />
      )}

      {showAboutModal && (
        <AboutModal onClose={() => setShowAboutModal(false)} onShowToast={showToast} />
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
