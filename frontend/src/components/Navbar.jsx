import AtomLogo from "./AtomLogo";
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Link2, BarChart2, LayoutDashboard, User, LogIn, LogOut, ShieldCheck } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenAuth, onOpenProfile }) {
  const { theme, toggleTheme, user, isAuthenticated, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <header className="navbar-wrapper">
      <nav className="navbar">
        {/* Left: Brand */}
        <a href="#" className="nav-brand" onClick={(e) => { e.preventDefault(); setActiveTab('shortener'); }}>
          <AtomLogo size={28} />
          <span>atomURL</span>
        </a>

        {/* Center: Navigation Pill Group */}
        <div className="nav-pill-group">
          <button
            className={`nav-pill-btn ${activeTab === 'shortener' ? 'active' : ''}`}
            onClick={() => setActiveTab('shortener')}
          >
            <Link2 size={15} />
            <span>Shorten</span>
          </button>
          
          {isAuthenticated && (
            <button
              className={`nav-pill-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={15} />
              <span>Dashboard</span>
            </button>
          )}

          <button
            className={`nav-pill-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart2 size={15} />
            <span>Analytics</span>
          </button>

          {user?.isAdmin && (
            <button
              className={`nav-pill-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              <ShieldCheck size={15} />
              <span>Admin</span>
            </button>
          )}
        </div>

        {/* Right: Actions */}
        <div className="nav-actions">
          {/* Theme Switcher */}
          <button
            className="btn btn-secondary btn-icon"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* User Auth */}
          {isAuthenticated ? (
            <div className="nav-user-container">
              <button
                className="btn btn-secondary nav-user-btn"
                onClick={onOpenProfile}
                title={user?.name || user?.email || 'Account'}
              >
                <User size={15} className="nav-user-icon" />
                <span className="nav-user-name">
                  {user?.name || user?.email?.split('@')[0] || 'Account'}
                </span>
              </button>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setShowLogoutConfirm(true)}
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={onOpenAuth}>
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-backdrop" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '24px', maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <LogOut size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>Sign Out of atomURL?</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5', margin: '0 0 24px 0' }}>
              Are you sure you want to sign out of your account?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                  if (activeTab === 'dashboard' || activeTab === 'admin') {
                    setActiveTab('shortener');
                  }
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
