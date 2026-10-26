import AtomLogo from "./AtomLogo";
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Link2, BarChart2, LayoutDashboard, User, LogIn, LogOut } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenAuth, onOpenProfile }) {
  const { theme, toggleTheme, user, isAuthenticated, logout } = useAuth();

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
                onClick={logout}
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
    </header>
  );
}
