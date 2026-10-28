import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { 
  ShieldCheck, 
  Activity, 
  Users, 
  AlertTriangle, 
  Database, 
  Zap, 
  Mail, 
  RefreshCw, 
  Trash2, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Cpu,
  Layers,
  MousePointerClick,
  X
} from 'lucide-react';

export default function AdminPage({ onShowToast }) {
  const [subTab, setSubTab] = useState('overview'); // 'overview' | 'users' | 'errors'
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  
  // Users state with 300ms debounce
  const [usersData, setUsersData] = useState({ users: [], total: 0, page: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [userPage, setUserPage] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Errors state
  const [errorsList, setErrorsList] = useState([]);
  const [loadingErrors, setLoadingErrors] = useState(false);
  const [clearingErrors, setClearingErrors] = useState(false);

  // 300ms Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setUserPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Overview
  const fetchOverview = useCallback(async () => {
    try {
      setLoadingOverview(true);
      const res = await api.getAdminOverview();
      if (res && res.data) {
        setOverview(res.data);
      }
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to fetch admin overview', 'error');
    } finally {
      setLoadingOverview(false);
    }
  }, [onShowToast]);

  // Fetch Users
  const fetchUsers = useCallback(async (query = debouncedSearch, page = userPage) => {
    try {
      setLoadingUsers(true);
      const res = await api.getAdminUsers(query, page, 15);
      if (res && res.data) {
        setUsersData({
          users: res.data.users || [],
          total: res.data.total || 0,
          page: res.data.page || 0,
          totalPages: res.data.totalPages || 1
        });
      }
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to fetch users', 'error');
    } finally {
      setLoadingUsers(false);
    }
  }, [debouncedSearch, userPage, onShowToast]);

  // Fetch Errors (silent background mode for live polling)
  const fetchErrors = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoadingErrors(true);
      const res = await api.getAdminErrors();
      if (res && res.data) {
        setErrorsList(res.data);
      }
    } catch (err) {
      if (!isSilent && onShowToast) onShowToast(err.message || 'Failed to fetch errors', 'error');
    } finally {
      if (!isSilent) setLoadingErrors(false);
    }
  }, [onShowToast]);

  // Clear Errors
  const handleClearErrors = async () => {
    if (!window.confirm('Are you sure you want to clear the system error buffer?')) return;
    try {
      setClearingErrors(true);
      await api.clearAdminErrors();
      setErrorsList([]);
      if (onShowToast) onShowToast('System error buffer cleared', 'success');
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to clear error buffer', 'error');
    } finally {
      setClearingErrors(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // Subtab switching & data load
  useEffect(() => {
    if (subTab === 'users') {
      fetchUsers(debouncedSearch, userPage);
    } else if (subTab === 'errors') {
      fetchErrors(false);
    }
  }, [subTab, userPage, debouncedSearch, fetchUsers, fetchErrors]);

  // Live polling (every 4 seconds) ONLY when active on the Errors tab
  useEffect(() => {
    if (subTab !== 'errors') return;

    const interval = setInterval(() => {
      fetchErrors(true); // silent background fetch
    }, 4000);

    return () => clearInterval(interval);
  }, [subTab, fetchErrors]);

  // Format Helpers
  const formatUptime = (seconds) => {
    if (!seconds && seconds !== 0) return '—';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return 'Never';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
             ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="admin-page" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: 'var(--radius-md)', 
              background: 'rgba(239, 68, 68, 0.12)', 
              color: '#ef4444', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Admin Console</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                Live platform infrastructure, usage telemetry & error logs
              </p>
            </div>
          </div>
        </div>

        <button 
          className="btn btn-secondary" 
          onClick={() => {
            if (subTab === 'overview') fetchOverview();
            if (subTab === 'users') fetchUsers();
            if (subTab === 'errors') fetchErrors(false);
          }}
          disabled={loadingOverview || loadingUsers || loadingErrors}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={15} className={(loadingOverview || loadingUsers || loadingErrors) ? 'spin-anim' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Sub-Tabs Nav Pill Group */}
      <div style={{ 
        display: 'flex', 
        gap: '6px', 
        background: 'var(--bg-secondary)', 
        padding: '5px', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--border)',
        marginBottom: '28px',
        maxWidth: '520px'
      }}>
        <button
          className={`nav-pill-btn ${subTab === 'overview' ? 'active' : ''}`}
          onClick={() => setSubTab('overview')}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <Activity size={15} />
          <span>Overview</span>
        </button>
        <button
          className={`nav-pill-btn ${subTab === 'users' ? 'active' : ''}`}
          onClick={() => setSubTab('users')}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <Users size={15} />
          <span>Users</span>
          {overview?.metrics?.totalUsers > 0 && (
            <span style={{ 
              background: subTab === 'users' ? 'var(--text-primary)' : 'var(--border)', 
              color: subTab === 'users' ? 'var(--bg-surface)' : 'var(--text-secondary)',
              fontSize: '0.7rem', 
              padding: '1px 6px', 
              borderRadius: '10px',
              fontWeight: 600
            }}>
              {overview.metrics.totalUsers}
            </span>
          )}
        </button>
        <button
          className={`nav-pill-btn ${subTab === 'errors' ? 'active' : ''}`}
          onClick={() => setSubTab('errors')}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <AlertTriangle size={15} />
          <span>Errors</span>
          {errorsList.length > 0 && (
            <span style={{ 
              background: '#ef4444', 
              color: '#ffffff', 
              fontSize: '0.7rem', 
              padding: '1px 6px', 
              borderRadius: '10px',
              fontWeight: 700 
            }}>
              {errorsList.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: OVERVIEW & HEALTH */}
      {subTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Service Health Cards */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)' }}>
              Service Connectivity & Health
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {/* PostgreSQL */}
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', color: 'var(--brand-primary)' }}>
                      <Database size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem' }}>PostgreSQL</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Primary relational store</span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: overview?.services?.database?.status === 'UP' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: overview?.services?.database?.status === 'UP' ? '#22c55e' : '#ef4444'
                  }}>
                    {overview?.services?.database?.status || 'CHECKING'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Ping Latency</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {overview?.services?.database?.latencyMs !== undefined ? `${overview.services.database.latencyMs} ms` : '—'}
                  </span>
                </div>
              </div>

              {/* CacheCore */}
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', background: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }}>
                      <Zap size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem' }}>CacheCore</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TCP in-memory cache</span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: overview?.services?.cachecore?.status === 'UP' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: overview?.services?.cachecore?.status === 'UP' ? '#22c55e' : '#ef4444'
                  }}>
                    {overview?.services?.cachecore?.status || 'CHECKING'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Ping Latency</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {overview?.services?.cachecore?.latencyMs !== undefined ? `${overview.services.cachecore.latencyMs} ms` : '—'}
                  </span>
                </div>
              </div>

              {/* SMTP Mailer */}
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', color: 'var(--brand-primary)' }}>
                      <Mail size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem' }}>SMTP Mailer</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Email OTP delivery</span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(59, 130, 246, 0.15)',
                    color: '#3b82f6'
                  }}>
                    READY
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Host</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 500 }}>
                    {overview?.services?.mail?.host || 'smtp'}:{overview?.services?.mail?.port || '587'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Metrics (Counters) */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)' }}>
              Platform Metrics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>
                  <Layers size={16} />
                  <span>Total URLs</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
                  {overview?.metrics?.totalUrls ?? '—'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  +{overview?.metrics?.todayUrls ?? 0} created today
                </div>
              </div>

              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>
                  <MousePointerClick size={16} />
                  <span>Total Clicks</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
                  {overview?.metrics?.totalClicks ?? '—'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  +{overview?.metrics?.todayClicks ?? 0} clicks today
                </div>
              </div>

              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>
                  <Users size={16} />
                  <span>Registered Users</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
                  {overview?.metrics?.totalUsers ?? '—'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {overview?.metrics?.todayActiveUsers ?? 0} active today
                </div>
              </div>

              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>
                  <Clock size={16} />
                  <span>Runtime Uptime</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
                  {formatUptime(overview?.jvm?.uptimeSeconds)}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Java 25 / Spring Boot 3
                </div>
              </div>
            </div>
          </div>

          {/* JVM & Memory Card */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Cpu size={20} style={{ color: 'var(--brand-primary)' }} />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>JVM Memory Footprint</h3>
            </div>
            {overview?.jvm ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                  <span>Used Heap: <strong>{overview.jvm.usedMemoryMb} MB</strong> / {overview.jvm.totalMemoryMb} MB</span>
                  <span style={{ color: 'var(--text-secondary)' }}>Max: {overview.jvm.maxMemoryMb} MB</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, (overview.jvm.usedMemoryMb / Math.max(1, overview.jvm.totalMemoryMb)) * 100)}%`,
                    height: '100%',
                    background: 'var(--brand-primary)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            ) : (
              <div className="skeleton" style={{ height: '36px', width: '100%' }} />
            )}
          </div>
        </div>
      )}

      {/* TAB 2: USER DIRECTORY */}
      {subTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Dashboard-Consistent Search and Refresh Bar */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input-text"
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '38px', paddingRight: search ? '36px' : '16px' }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  title="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <button 
              className="btn btn-secondary btn-icon" 
              onClick={() => fetchUsers(debouncedSearch, userPage)} 
              title="Refresh users"
            >
              <RefreshCw size={16} className={loadingUsers ? 'spin-anim' : ''} />
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span>Showing registered platform users</span>
            <span>Total: <strong>{usersData.total}</strong> users</span>
          </div>

          {/* Table Container */}
          <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>User</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Provider</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Last Login</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>URLs Created</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <RefreshCw size={20} className="spin-anim" style={{ margin: '0 auto 8px auto' }} />
                      Loading users...
                    </td>
                  </tr>
                ) : usersData.users.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No users found matching query
                    </td>
                  </tr>
                ) : (
                  usersData.users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.1s ease' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name || 'Anonymous User'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: u.signinProvider?.toUpperCase() === 'GOOGLE' ? 'rgba(234, 67, 53, 0.12)' :
                                      u.signinProvider?.toUpperCase() === 'GITHUB' ? 'rgba(156, 163, 175, 0.2)' :
                                      'rgba(59, 130, 246, 0.15)',
                          color: u.signinProvider?.toUpperCase() === 'GOOGLE' ? '#ea4335' :
                                 u.signinProvider?.toUpperCase() === 'GITHUB' ? 'var(--text-primary)' :
                                 '#3b82f6'
                        }}>
                          {u.signinProvider?.toUpperCase() || 'EMAIL'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {formatDate(u.lastLoginDate)}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border)'
                        }}>
                          {u.urlCount || 0}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {usersData.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
              <button 
                className="btn btn-secondary btn-icon"
                disabled={usersData.page <= 0 || loadingUsers}
                onClick={() => setUserPage(prev => Math.max(0, prev - 1))}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Page <strong>{usersData.page + 1}</strong> of {usersData.totalPages}
              </span>
              <button 
                className="btn btn-secondary btn-icon"
                disabled={usersData.page >= usersData.totalPages - 1 || loadingUsers}
                onClick={() => setUserPage(prev => prev + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ERROR LOG WITH LIVE POLLING */}
      {subTab === 'errors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Buffer: <strong>{errorsList.length}</strong> / 100 recent errors
              </span>
              {/* Live Polling Indicator */}
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: '2px 8px', 
                borderRadius: 'var(--radius-full)',
                background: 'rgba(34, 197, 94, 0.12)',
                color: '#22c55e',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  display: 'inline-block',
                  boxShadow: '0 0 6px #22c55e'
                }} />
                Live Stream (4s)
              </div>
            </div>

            {errorsList.length > 0 && (
              <button 
                className="btn btn-secondary" 
                onClick={handleClearErrors} 
                disabled={clearingErrors}
                style={{ color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 size={15} />
                <span>Clear Buffer</span>
              </button>
            )}
          </div>

          {loadingErrors && errorsList.length === 0 ? (
            <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <RefreshCw size={24} className="spin-anim" style={{ margin: '0 auto 12px auto' }} />
              Loading error log...
            </div>
          ) : errorsList.length === 0 ? (
            <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
              <CheckCircle2 size={36} style={{ color: '#22c55e', margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.1rem', margin: '0 0 6px 0' }}>All Systems Nominal</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                Zero exceptions or connection failures captured in the memory buffer.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {errorsList.map((err) => (
                <div key={err.id} className="card" style={{ padding: '16px', borderLeft: '4px solid #ef4444' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#ef4444'
                    }}>
                      {err.service}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {formatDate(err.timestamp)}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    {err.message}
                  </div>
                  {err.details && err.details !== err.message && (
                    <pre style={{
                      background: 'var(--bg-secondary)',
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-secondary)',
                      overflowX: 'auto',
                      margin: '6px 0 0 0',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all'
                    }}>
                      {err.details}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
