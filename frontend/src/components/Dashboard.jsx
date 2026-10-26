const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Copy, Check, Trash2, BarChart2, ExternalLink, Search, RefreshCw, Link2, MousePointer } from 'lucide-react';

export default function Dashboard({ onShowToast, onViewAnalytics }) {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchUrls = async () => {
    setLoading(true);
    try {
      const res = await api.getUserUrls();
      setUrls(res.data || []);
    } catch (err) {
      onShowToast(err.message || 'Failed to load URLs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleCopy = (shortCode) => {
    const fullUrl = `${API_BASE}/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedCode(shortCode);
    onShowToast('Copied short link!');
    setTimeout(() => setCopiedCode(null), 2000);
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

  const filteredUrls = urls.filter(u => 
    u.shortCode.toLowerCase().includes(search.toLowerCase()) ||
    u.longUrl.toLowerCase().includes(search.toLowerCase())
  );

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
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Links</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{urls.length}</div>
            </div>
          </div>

          <div className="card" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MousePointer size={18} style={{ color: 'var(--success)' }} />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Clicks</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{totalClicks}</div>
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
            placeholder="Search by short code or destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
        </div>
        <button className="btn btn-secondary btn-icon" onClick={fetchUrls} title="Refresh">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* URLs List */}
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
      ) : filteredUrls.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <Link2 size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>No links found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {search ? 'No links match your search query.' : 'You haven\'t created any shortened links yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredUrls.map(item => (
            <div key={item.shortCode} className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ minWidth: '220px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <a
                    href={`${API_BASE}/${item.shortCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      textDecoration: 'none'
                    }}
                  >
                    /{item.shortCode}
                  </a>
                  <span className="badge badge-accent">
                    {item.totalClicks} clicks
                  </span>
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '480px' }}>
                  {item.longUrl}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                  className="btn btn-danger btn-icon"
                  onClick={() => setDeleteConfirm(item.shortCode)}
                  title="Delete Link"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '8px', color: 'var(--danger)' }}>Delete Short Link?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Are you sure you want to delete <strong>/{deleteConfirm}</strong>? This action will permanently disable the link and remove all its click analytics.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete Link</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
