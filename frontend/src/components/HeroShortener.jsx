import React, { useState, useEffect } from 'react';
import { api, API_BASE } from '../api/client';
import { copyToClipboard } from '../utils/clipboard';
import { formatCompactNumber, getFaviconUrl } from '../utils/formatters';

const SCHEME_REGEX = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/\S+$/;
import { useAuth } from '../context/AuthContext';
import { Link2, Copy, Check, ExternalLink, ArrowRight, Clock, ShieldCheck, BarChart2, Zap } from 'lucide-react';


export default function HeroShortener({ onShowToast, onUrlCreated, onViewAnalytics }) {
  const { isAuthenticated } = useAuth();
  const [longUrl, setLongUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [urlError, setUrlError] = useState('');

  // Recent link analytics state
  const [recentLink, setRecentLink] = useState(null);
  const [recentStats, setRecentStats] = useState([]);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const fetchRecentAnalytics = async () => {
    if (!isAuthenticated) {
      setRecentLink(null);
      setRecentStats([]);
      return;
    }

    setLoadingRecent(true);
    try {
      // Use the new limit=1 parameter to get the most recent URL
      const res = await api.getUserUrls(1);
      const urls = res.data || [];
      if (urls.length > 0) {
        const top = urls[0];
        setRecentLink(top);
        const statsRes = await api.getAnalytics(top.shortCode, 30);
        const rawStats = statsRes.data || [];
        
        // Map backend clicks (which use 'date' and 'clicks')
        const clicksMap = {};
        rawStats.forEach(item => {
          const d = item.date || item.accessDate;
          const count = item.clicks ?? item.accessCount ?? 0;
          if (d) clicksMap[d] = count;
        });

        // Generate full 30-day timeline leading to today
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
        setRecentStats(timeline);
        if (timeline.length > 0) {
          setHoveredDay(timeline[timeline.length - 1]);
        }
      } else {
        setRecentLink(null);
        setRecentStats([]);
        setHoveredDay(null);
      }
    } catch (err) {
      console.error('Failed to load recent link analytics', err);
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    fetchRecentAnalytics();
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const target = longUrl.trim();
    if (!target) return;

    // Validate scheme in UI without prepending anything
    if (!SCHEME_REGEX.test(target)) {
      setUrlError('Invalid URL: please include a valid scheme (e.g. https://example.com or test://example.com)');
      return;
    }

    setUrlError('');
    setLoading(true);
    try {
      const res = await api.createShortUrl(target);
      const data = res.data || {};
      const fullShortUrl = `${API_BASE}/${data.shortCode}`;
      setResult({
        ...data,
        shortUrl: fullShortUrl
      });
      setCopied(false);
      // Reset input box on success only
      setLongUrl('');
      onShowToast('URL shortened successfully!');
      if (onUrlCreated) onUrlCreated();
      // Refresh recent link analytics
      fetchRecentAnalytics();
    } catch (err) {
      const errorMsg = err.data?.message || err.message || 'Failed to shorten URL';
      setUrlError(errorMsg);
      onShowToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.shortUrl) return;
    const ok = await copyToClipboard(result.shortUrl);
    if (ok) {
      setCopied(true);
      onShowToast('Copied short link to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      onShowToast('Failed to copy to clipboard', 'error');
    }
  };

  return (
    <section style={{ maxWidth: '640px', margin: '0 auto 64px auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '12px', lineHeight: 1.15 }}>
        Shorten, share, and track.
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '32px' }}>
        Fast, reliable links with real-time click insights.
      </p>

      {/* Input Card */}
      <div className="card" style={{ padding: '16px', marginBottom: '24px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
            <Link2 size={18} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-text"
              placeholder="Paste long link here (e.g. https://my-portfolio.com)..."
              value={longUrl}
              onChange={(e) => {
                setLongUrl(e.target.value);
                if (urlError) setUrlError('');
              }}
              style={{
                paddingLeft: '42px',
                borderColor: urlError ? 'var(--danger)' : undefined
              }}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading || !longUrl.trim()}
            style={{ cursor: (loading || !longUrl.trim()) ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Shortening...' : (
              <>
                <span>Shorten</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>
        {urlError && (
          <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '10px', textAlign: 'left', paddingLeft: '4px' }}>
            {urlError}
          </div>
        )}
      </div>

      {/* Result Card */}
      {result && (
        <div className="card" style={{ textAlign: 'left', animation: 'scaleUp 0.15s ease-out', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span className={`badge ${isAuthenticated ? 'badge-success' : 'badge-neutral'}`}>
              {isAuthenticated ? (
                <>
                  <ShieldCheck size={12} />
                  <span>Permanent link · Never expires</span>
                </>
              ) : (
                <>
                  <Clock size={12} />
                  <span>Guest link · Active for 30 days</span>
                </>
              )}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Code: <strong style={{ color: 'var(--text-primary)' }}>{result.shortCode}</strong>
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '16px',
            gap: '12px'
          }}>
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 500,
                fontSize: '0.975rem',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                wordBreak: 'break-all'
              }}
            >
              {result.shortUrl}
            </a>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <button className="btn btn-secondary" onClick={handleCopy} title="Copy URL">
                {copied ? <Check size={16} style={{ color: 'var(--success)' }} /> : <Copy size={16} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <a
                href={result.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-icon"
                title="Open in new tab"
                aria-label="Open in new tab"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Points to:</span>
            {getFaviconUrl(result.longUrl) && (
              <img
                src={getFaviconUrl(result.longUrl)}
                alt=""
                width={14}
                height={14}
                style={{ borderRadius: '2px', flexShrink: 0 }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
            <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{result.longUrl}</span>
          </div>
        </div>
      )}

      {/* Dynamic Section: Recent Link Analytics (if logged in & has links) OR 3 Feature Pointers (guest / no links) */}
      {isAuthenticated && recentLink ? (
        <div className="card" style={{ textAlign: 'left', marginTop: '24px', padding: '20px 22px' }}>
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                display: 'inline-flex',
                padding: '5px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-light)',
                color: 'var(--accent)'
              }}>
                <BarChart2 size={16} />
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.925rem' }}>Recent Link:</span>
              <a
                href={`${API_BASE}/${recentLink.shortCode}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: 'var(--accent)',
                  textDecoration: 'none',
                  maxWidth: '160px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'inline-block',
                  verticalAlign: 'middle'
                }}
                title={`/${recentLink.shortCode}`}
              >
                /{recentLink.shortCode}
              </a>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Dynamic Day Inspection Pill on Hover */}
              {hoveredDay && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--bg-secondary)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: '0.75rem'
                }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {hoveredDay.date ? hoveredDay.date.split('-').slice(1).join('/') : ''}:
                  </span>
                  <span style={{
                    fontWeight: 700,
                    color: hoveredDay.clicks > 0 ? 'var(--accent)' : 'var(--text-muted)'
                  }} title={`${(hoveredDay.clicks || 0).toLocaleString()} clicks`}>
                    {formatCompactNumber(hoveredDay.clicks)} {hoveredDay.clicks === 1 ? 'click' : 'clicks'}
                  </span>
                </div>
              )}

              <button
                className="btn btn-secondary"
                onClick={() => onViewAnalytics && onViewAnalytics(recentLink.shortCode)}
                style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                title="Open detailed analytics page"
              >
                <span>Full View</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span>Points to:</span>
              {getFaviconUrl(recentLink.longUrl) && (
                <img
                  src={getFaviconUrl(recentLink.longUrl)}
                  alt=""
                  width={14}
                  height={14}
                  style={{ borderRadius: '2px', flexShrink: 0 }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
              <span style={{ color: 'var(--text-secondary)' }}>{recentLink.longUrl}</span>
            </span>
          </div>

          {/* Mini Interactive 30-Day Activity Chart */}
          {recentStats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
              No click activity recorded yet.
            </div>
          ) : (
            <div>
              <div
                onMouseLeave={() => setHoveredDay(null)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '4px',
                  height: '75px',
                  padding: '10px 10px 6px 10px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  cursor: 'default',
                  position: 'relative'
                }}
              >
                {(() => {
                  const max = Math.max(...recentStats.map(r => r.clicks || 0), 1);
                  return recentStats.map((s, idx) => {
                    const hasClicks = s.clicks > 0;
                    const isHovered = hoveredDay && hoveredDay.date === s.date;
                    const heightPercent = hasClicks
                      ? Math.max(Math.round((s.clicks / max) * 100), 20)
                      : 8;

                    return (
                      <div
                        key={idx}
                        onMouseEnter={(e) => {
                          e.stopPropagation();
                          setHoveredDay(s);
                        }}
                        onTouchStart={() => {
                          setHoveredDay(s);
                        }}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          height: '100%',
                          justifyContent: 'flex-end',
                          position: 'relative'
                        }}
                      >
                        <div style={{
                          width: '100%',
                          height: `${heightPercent}%`,
                          backgroundColor: hasClicks
                            ? (isHovered ? 'var(--accent-hover)' : 'var(--accent)')
                            : (isHovered ? 'var(--text-muted)' : 'var(--border)'),
                          borderRadius: '2px 2px 0 0',
                          transition: 'all 0.15s ease',
                          opacity: hasClicks ? 1 : (isHovered ? 0.75 : 0.45),
                          boxShadow: isHovered && hasClicks ? '0 0 8px rgba(99, 102, 241, 0.5)' : 'none'
                        }} />
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Timeline date bounds */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px', padding: '0 2px' }}>
                <span>30 days ago ({recentStats[0]?.date ? recentStats[0].date.split('-').slice(1).join('/') : ''})</span>
                <span>Today ({recentStats[recentStats.length - 1]?.date ? recentStats[recentStats.length - 1].date.split('-').slice(1).join('/') : ''})</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 3-Pointer Feature Grid for Guests / Users without links */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginTop: '28px',
          textAlign: 'left'
        }}>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'inline-flex', padding: '8px', borderRadius: 'var(--radius-md)', background: 'var(--accent-light)', color: 'var(--accent)', marginBottom: '12px' }}>
              <Zap size={18} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '6px' }}>Instant Redirects</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              High-speed routing delivers instant redirection to your destination.
            </p>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'inline-flex', padding: '8px', borderRadius: 'var(--radius-md)', background: 'var(--success-light)', color: 'var(--success)', marginBottom: '12px' }}>
              <BarChart2 size={18} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '6px' }}>Click Analytics</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Real-time click counts and 30-day daily traffic breakdown.
            </p>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'inline-flex', padding: '8px', borderRadius: 'var(--radius-md)', background: 'var(--accent-light)', color: 'var(--accent-text)', marginBottom: '12px' }}>
              <ShieldCheck size={18} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '6px' }}>Permanent Links</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Sign in with Email OTP or Google/GitHub to keep links forever.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
