import React, { useState, useEffect } from 'react';
import { api, API_BASE } from '../api/client';
import { copyToClipboard } from '../utils/clipboard';
import { formatCompactNumber, getFaviconUrl } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart2,
  ArrowRight, 
  Search, 
  Copy, 
  Check, 
  ExternalLink, 
  ArrowUpRight, 
  Calendar, 
  TrendingUp, 
  Activity, 
  Link2,
  RefreshCw
} from 'lucide-react';


export default function AnalyticsPage({ initialShortCode, onShowToast, onViewDashboard }) {
  const { isAuthenticated } = useAuth();
  const [code, setCode] = useState(initialShortCode || '');
  const [searchedCode, setSearchedCode] = useState(initialShortCode || '');
  const [loading, setLoading] = useState(false);
  const [userUrls, setUserUrls] = useState([]);
  const [loadingUrls, setLoadingUrls] = useState(false);
  const [stats, setStats] = useState([]);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [copied, setCopied] = useState(false);

  // Load user's URLs if authenticated to enable one-click selection
  useEffect(() => {
    if (isAuthenticated) {
      setLoadingUrls(true);
      api.getUserUrls()
        .then(res => {
          const urls = res.data || [];
          setUserUrls(urls);
          // If no initialShortCode was passed, default to the most recent link
          if (!initialShortCode && urls.length > 0) {
            setCode(urls[0].shortCode);
            fetchAnalytics(urls[0].shortCode);
          }
        })
        .catch(err => console.error('Failed to load user URLs', err))
        .finally(() => setLoadingUrls(false));
    }
  }, [isAuthenticated]);

  // When initialShortCode prop changes (e.g. navigated from Dashboard or Hero)
  useEffect(() => {
    if (initialShortCode) {
      setCode(initialShortCode);
      fetchAnalytics(initialShortCode);
    }
  }, [initialShortCode]);

  const fetchAnalytics = async (targetCode) => {
    if (!targetCode || !targetCode.trim()) return;
    const cleanCode = targetCode.trim().replace(/^\/+/g, '');
    setLoading(true);
    try {
      const res = await api.getAnalytics(cleanCode, 30);
      const rawData = res.data || [];

      // Map raw stats into a lookup by date string (YYYY-MM-DD)
      const clicksMap = {};
      rawData.forEach(item => {
        const d = item.date || item.accessDate;
        const count = item.clicks ?? item.accessCount ?? 0;
        if (d) clicksMap[d] = count;
      });

      // Build complete continuous 30-day timeline leading to today
      const timeline = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        timeline.push({
          date: dateStr,
          clicks: clicksMap[dateStr] || 0
        });
      }

      setStats(timeline);
      setSearchedCode(cleanCode);
      // Default hovered day to today
      setHoveredDay(timeline[timeline.length - 1]);
    } catch (err) {
      onShowToast(err.message || 'Failed to fetch analytics for link', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (code.trim()) {
      fetchAnalytics(code.trim());
    }
  };

  const handleSelectLink = (itemCode) => {
    setCode(itemCode);
    fetchAnalytics(itemCode);
  };

  const handleCopyLink = async () => {
    if (!searchedCode) return;
    const fullUrl = `${API_BASE}/${searchedCode}`;
    const ok = await copyToClipboard(fullUrl);
    if (ok) {
      setCopied(true);
      onShowToast('Short link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } else {
      onShowToast('Failed to copy link', 'error');
    }
  };

  // Metrics calculations
  const totalClicks = stats.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  const maxClicks = Math.max(...stats.map(s => s.clicks || 0), 1);
  const activeDaysCount = stats.filter(s => s.clicks > 0).length;
  const peakDay = stats.reduce((prev, curr) => (curr.clicks > prev.clicks ? curr : prev), { date: '', clicks: 0 });
  const dailyAverage = (totalClicks / 30).toFixed(1);

  // Find destination URL if present in userUrls
  const matchedUserUrl = userUrls.find(u => u.shortCode === searchedCode);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const [year, month, day] = dateStr.split('-');
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '16px 0 48px 0' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-light)',
            color: 'var(--accent)'
          }}>
            <BarChart2 size={22} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Click Analytics</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
          Real-time performance and 30-day click breakdown for your shortened links.
        </p>
      </div>

      {/* Search & Selector Bar */}
      <div className="card" style={{ padding: '18px 20px', marginBottom: '24px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem'
            }}>
              /
            </span>
            <input
              type="text"
              className="input-text"
              placeholder="Enter short code (e.g. F, 4fG2)..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{ paddingLeft: '28px' }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !code.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: (loading || !code.trim()) ? 'not-allowed' : 'pointer' }}
          >
            {loading ? <RefreshCw size={16} className="spin-anim" /> : <Search size={16} />}
            <span>{loading ? 'Analyzing...' : 'Analyze Link'}</span>
          </button>
        </form>

        {/* User's Links Quick Selector */}
        {isAuthenticated && userUrls.length > 0 && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Recent Links
                </span>
                <span className="badge badge-accent" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>
                  {userUrls.length}
                </span>
              </div>

              {onViewDashboard && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={onViewDashboard}
                  style={{
                    fontSize: '0.75rem',
                    padding: '2px 6px',
                    color: 'var(--accent-text)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Browse and search all your links in Dashboard"
                >
                  <span>Browse all in Dashboard</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>

            {/* Single-row swipeable/scrollable track */}
            <div
              className="recent-links-track"
              style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '8px',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {userUrls.map((item) => {
                const isSelected = item.shortCode === searchedCode;
                const formattedClicks = formatCompactNumber(item.totalClicks);
                return (
                  <button
                    key={item.shortCode}
                    onClick={() => handleSelectLink(item.shortCode)}
                    disabled={loading}
                    className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      padding: '5px 10px',
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-mono)',
                      flexShrink: 0,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      maxWidth: '160px'
                    }}
                    title={`/${item.shortCode} (${(item.totalClicks || 0).toLocaleString()} clicks)`}
                  >
                    <span style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '85px'
                    }}>
                      /{item.shortCode}
                    </span>
                    <span style={{
                      opacity: isSelected ? 0.9 : 0.6,
                      fontSize: '0.725rem',
                      flexShrink: 0
                    }}>
                      ({formattedClicks})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Analytics Content */}
      {searchedCode ? (
        <div>
          {/* Active Link Banner */}
          <div className="card" style={{ padding: '20px', marginBottom: '20px', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--accent)',
                    maxWidth: '260px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'inline-block',
                    verticalAlign: 'middle'
                  }} title={`/${searchedCode}`}>
                    /{searchedCode}
                  </span>
                  <span className="badge badge-accent" title={`${totalClicks.toLocaleString()} clicks (30d)`}>
                    {formatCompactNumber(totalClicks)} {totalClicks === 1 ? 'click' : 'clicks'} (30d)
                  </span>
                </div>
                {matchedUserUrl && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span>Points to:</span>
                    {getFaviconUrl(matchedUserUrl.longUrl) && (
                      <img
                        src={getFaviconUrl(matchedUserUrl.longUrl)}
                        alt=""
                        width={14}
                        height={14}
                        style={{ borderRadius: '2px', flexShrink: 0 }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <span style={{ color: 'var(--text-primary)' }}>{matchedUserUrl.longUrl}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={handleCopyLink}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                >
                  {copied ? <Check size={15} style={{ color: 'var(--success)' }} /> : <Copy size={15} />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <a
                  href={`${API_BASE}/${searchedCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-icon"
                  title="Open redirect destination in new tab"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div className="card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total 30-Day Clicks</span>
                <Activity size={16} style={{ color: 'var(--accent)' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent)' }}>
                {totalClicks}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {activeDaysCount} active {activeDaysCount === 1 ? 'day' : 'days'} recorded
              </div>
            </div>

            <div className="card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Peak Traffic Day</span>
                <TrendingUp size={16} style={{ color: 'var(--success)' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {peakDay.clicks} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>clicks</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {peakDay.clicks > 0 ? formatDate(peakDay.date) : 'No peak activity'}
              </div>
            </div>

            <div className="card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily Average</span>
                <Calendar size={16} style={{ color: 'var(--text-secondary)' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {dailyAverage}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Clicks per day (30d window)
              </div>
            </div>
          </div>

          {/* Interactive 30-Day Bar Chart */}
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Daily Click Activity</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Hover over bars to inspect daily traffic metrics
                </span>
              </div>

              {/* Dynamic Hover Status Card */}
              {hoveredDay && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'var(--bg-secondary)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    {formatDate(hoveredDay.date)}:
                  </div>
                  <div style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: hoveredDay.clicks > 0 ? 'var(--accent)' : 'var(--text-muted)'
                  }}>
                    {hoveredDay.clicks} {hoveredDay.clicks === 1 ? 'click' : 'clicks'}
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Chart Area */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '4px',
              height: '180px',
              padding: '16px 12px 8px 12px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              position: 'relative'
            }}>
              {stats.map((s, idx) => {
                const hasClicks = s.clicks > 0;
                const isHovered = hoveredDay && hoveredDay.date === s.date;
                const heightPercent = hasClicks
                  ? Math.max(Math.round((s.clicks / maxClicks) * 100), 16)
                  : 8;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredDay(s)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'flex-end',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: `${heightPercent}%`,
                        backgroundColor: hasClicks
                          ? (isHovered ? 'var(--accent-hover)' : 'var(--accent)')
                          : (isHovered ? 'var(--text-muted)' : 'var(--border)'),
                        borderRadius: '3px 3px 0 0',
                        transition: 'all 0.15s ease',
                        opacity: hasClicks ? 1 : (isHovered ? 0.7 : 0.4),
                        boxShadow: isHovered && hasClicks ? '0 0 10px rgba(99, 102, 241, 0.5)' : 'none'
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-Axis Timeline Labels */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginTop: '10px',
              padding: '0 4px'
            }}>
              <span>30 days ago ({stats[0]?.date ? stats[0].date.split('-').slice(1).join('/') : ''})</span>
              <span>15 days ago</span>
              <span>Today ({stats[stats.length - 1]?.date ? stats[stats.length - 1].date.split('-').slice(1).join('/') : ''})</span>
            </div>
          </div>

          {/* Daily Activity Breakdown Table */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '14px' }}>
              Recorded Traffic Log
            </h3>
            {stats.filter(s => s.clicks > 0).length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '36px',
                color: 'var(--text-muted)',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem'
              }}>
                No clicks recorded for <strong>/{searchedCode}</strong> in the past 30 days.
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  Share your link with your audience to start capturing click analytics in real time!
                </div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '10px 12px' }}>Date</th>
                      <th style={{ padding: '10px 12px' }}>Clicks</th>
                      <th style={{ padding: '10px 12px' }}>Share of 30-Day Traffic</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats
                      .filter(s => s.clicks > 0)
                      .reverse()
                      .map((s, idx) => {
                        const percent = totalClicks > 0 ? Math.round((s.clicks / totalClicks) * 100) : 0;
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '12px', fontWeight: 500 }}>
                              {formatDate(s.date)}
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span className="badge badge-accent" style={{ fontWeight: 600 }}>
                                {s.clicks}
                              </span>
                            </td>
                            <td style={{ padding: '12px', width: '40%' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                  flex: 1,
                                  height: '6px',
                                  background: 'var(--bg-subtle)',
                                  borderRadius: 'var(--radius-full)',
                                  overflow: 'hidden'
                                }}>
                                  <div style={{
                                    width: `${percent}%`,
                                    height: '100%',
                                    background: 'var(--accent)',
                                    borderRadius: 'var(--radius-full)'
                                  }} />
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '35px' }}>
                                  {percent}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (loadingUrls || loading) ? (
        /* Stable Height Skeleton Placeholder during initial link load */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Link Banner Skeleton */}
          <div className="card" style={{ padding: '20px', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <div className="skeleton" style={{ width: '120px', height: '24px' }} />
              <div className="skeleton" style={{ width: '280px', height: '14px' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div className="skeleton" style={{ width: '70px', height: '34px', borderRadius: 'var(--radius-md)' }} />
              <div className="skeleton" style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-md)' }} />
            </div>
          </div>

          {/* 3 Metric Cards Skeletons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[1, 2, 3].map(n => (
              <div key={n} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="skeleton" style={{ width: '90px', height: '12px' }} />
                <div className="skeleton" style={{ width: '60px', height: '28px' }} />
                <div className="skeleton" style={{ width: '130px', height: '12px' }} />
              </div>
            ))}
          </div>

          {/* Chart Skeleton */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="skeleton" style={{ width: '140px', height: '18px' }} />
            <div className="skeleton" style={{ width: '100%', height: '140px', borderRadius: 'var(--radius-md)' }} />
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '48px', marginTop: '12px' }}>
          <BarChart2 size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>No link selected</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Enter a short code above or select one from your recent links to inspect click analytics.
          </p>
        </div>
      )}
    </div>
  );
}
