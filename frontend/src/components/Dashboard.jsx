import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api, API_BASE } from '../api/client';
import { copyToClipboard } from '../utils/clipboard';
import { formatCompactNumber, getFaviconUrl } from '../utils/formatters';
import { Copy, Check, Trash2, BarChart2, ExternalLink, Search, RefreshCw, Link2, MousePointer, X } from 'lucide-react';

const PAGE_SIZE = 15;

export default function Dashboard({ onShowToast, onViewAnalytics }) {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch URLs for current debounced search query (or initial load)
  const fetchUrls = useCallback(async (query) => {
    setLoading(true);
    try {
      const res = await api.getUserUrls(PAGE_SIZE, null, query || null);
      const items = res?.data || [];
      setUrls(items);
      setHasMore(items.length >= PAGE_SIZE);
    } catch (err) {
      onShowToast(err.message || 'Failed to load URLs', 'error');
    } finally {
      setLoading(false);
    }
  }, [onShowToast]);

  useEffect(() => {
    fetchUrls(debouncedSearch);
  }, [debouncedSearch, fetchUrls]);

  // Fetch next page via keyset cursor (after)
  const fetchMoreUrls = useCallback(async () => {
    if (loading || loadingMore || !hasMore || urls.length === 0) return;

    const lastItem = urls[urls.length - 1];
    if (!lastItem || !lastItem.shortCode) return;

    setLoadingMore(true);
    try {
      const res = await api.getUserUrls(PAGE_SIZE, lastItem.shortCode, debouncedSearch || null);
      const newItems = res?.data || [];
      if (newItems.length > 0) {
        setUrls(prev => {
          const existingCodes = new Set(prev.map(u => u.shortCode));
          const uniqueItems = newItems.filter(u => !existingCodes.has(u.shortCode));
          return [...prev, ...uniqueItems];
        });
      }
      setHasMore(newItems.length >= PAGE_SIZE);
    } catch (err) {
      onShowToast(err.message || 'Failed to load more URLs', 'error');
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, hasMore, urls, debouncedSearch, onShowToast]);

  // Stable ref for fetchMoreUrls to avoid recreating observer on every render
  const fetchMoreRef = useRef(fetchMoreUrls);
  useEffect(() => {
    fetchMoreRef.current = fetchMoreUrls;
  });

  // Callback ref: dynamically attaches IntersectionObserver the moment the sentinel DOM node renders
  const observerRef = useRef(null);
  const sentinelCallbackRef = useCallback((node) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    if (!node) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMoreRef.current();
        }
      },
      { rootMargin: '300px' }
    );

    observerRef.current.observe(node);
  }, []);

  const handleCopy = async (shortCode) => {
    const fullUrl = `${API_BASE}/${shortCode}`;
    const ok = await copyToClipboard(fullUrl);
    if (ok) {
      setCopiedCode(shortCode);
      onShowToast('Copied short link!');
      setTimeout(() => setCopiedCode(null), 2000);
    } else {
      onShowToast('Failed to copy link', 'error');
    }
  };

  const handleDelete = async (shortCode) => {
    try {
      await api.deleteUrl(shortCode);
      setUrls(prev => prev.filter(u => u.shortCode !== shortCode));
      setDeleteConfirm(null);
      onShowToast('Link deleted successfully');
    } catch (err) {
      onShowToast(err.message || 'Failed to delete URL', 'error');
    }
  };

  const totalClicks = urls.reduce((acc, curr) => acc + (curr.totalClicks || 0), 0);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto 64px auto' }}>
      {/* Header and Stats */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage your links and monitor traffic</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="card" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link2 size={18} style={{ color: 'var(--accent)' }} />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Loaded Links</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }} title={urls.length.toLocaleString()}>{formatCompactNumber(urls.length)}</div>
            </div>
          </div>

          <div className="card" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MousePointer size={18} style={{ color: 'var(--success)' }} />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Clicks</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }} title={totalClicks.toLocaleString()}>{formatCompactNumber(totalClicks)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Refresh */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-text"
            placeholder="Search links by short code or destination..."
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
        <button className="btn btn-secondary btn-icon" onClick={() => fetchUrls(debouncedSearch)} title="Refresh">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Initial Loading Skeletons */}
      {loading && urls.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <div className="skeleton" style={{ width: '80px', height: '22px' }} />
                <div className="skeleton" style={{ width: '240px', height: '14px' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)' }} />
                <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)' }} />
                <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)' }} />
              </div>
            </div>
          ))}
        </div>
      ) : urls.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <Link2 size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>No links found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {search ? 'No links match your search query.' : "You haven't created any shortened links yet."}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {urls.map(item => (
            <div key={item.shortCode} className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ minWidth: '180px', flex: 1, maxWidth: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <a
                    href={`${API_BASE}/${item.shortCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      maxWidth: '180px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'inline-block',
                      verticalAlign: 'middle'
                    }}
                    title={`/${item.shortCode}`}
                  >
                    /{item.shortCode}
                  </a>
                  <span className="badge badge-accent" title={`${(item.totalClicks || 0).toLocaleString()} clicks`}>
                    {formatCompactNumber(item.totalClicks)} {item.totalClicks === 1 ? 'click' : 'clicks'}
                  </span>
                </div>
                <div style={{
                  fontSize: '0.825rem',
                  color: 'var(--text-muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {getFaviconUrl(item.longUrl) && (
                    <img
                      src={getFaviconUrl(item.longUrl)}
                      alt=""
                      width={14}
                      height={14}
                      style={{ borderRadius: '2px', flexShrink: 0 }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.longUrl}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <button
                  className="btn btn-secondary btn-icon"
                  onClick={() => handleCopy(item.shortCode)}
                  title="Copy Link"
                >
                  {copiedCode === item.shortCode ? <Check size={15} style={{ color: 'var(--success)' }} /> : <Copy size={15} />}
                </button>
                <button
                  className="btn btn-secondary btn-icon"
                  onClick={() => onViewAnalytics(item.shortCode)}
                  title="View Analytics"
                >
                  <BarChart2 size={15} />
                </button>
                <a
                  href={`${API_BASE}/${item.shortCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-icon"
                  title="Open Link"
                >
                  <ExternalLink size={15} />
                </a>
                <button
                  className="btn btn-secondary btn-icon"
                  onClick={() => setDeleteConfirm(item.shortCode)}
                  title="Delete Link"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}

          {/* Sentinel element for infinite scroll */}
          <div ref={sentinelCallbackRef} style={{ height: '20px', margin: '6px 0' }} />

          {/* Loading More Spinner Indicator */}
          {loadingMore && (
            <div
              className="card"
              style={{
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: 'var(--text-muted)',
                fontSize: '0.85rem'
              }}
            >
              <RefreshCw size={15} className="animate-spin" />
              <span>Loading more links...</span>
            </div>
          )}

          {/* End of list reached */}
          {!hasMore && urls.length >= PAGE_SIZE && !search && (
            <div style={{ textAlign: 'center', padding: '18px 0 6px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              • You've reached the end of your links •
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '24px', maxWidth: '420px' }}>
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
                <Trash2 size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>Delete Short Link?</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5', margin: '0 0 24px 0' }}>
              Are you sure you want to delete <strong>/{deleteConfirm}</strong>? This action will permanently disable the link and remove all its click analytics.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => handleDelete(deleteConfirm)}
              >
                Delete Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
