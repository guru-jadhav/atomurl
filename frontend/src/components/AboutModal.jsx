import React, { useState } from 'react';
import AtomLogo from './AtomLogo';
import { X, Mail, Copy, Check } from 'lucide-react';

export default function AboutModal({ onClose, onShowToast }) {
  const [copied, setCopied] = useState(false);
  const contactEmail = 'atomurl.app@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactEmail).then(() => {
      setCopied(true);
      if (onShowToast) onShowToast('Contact email copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px', padding: '26px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AtomLogo size={24} />
            <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>
              About atom<span style={{ color: 'var(--accent)' }}>URL</span>
            </h3>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Overview */}
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '20px' }}>
          An open-source URL shortener and click analytics engine built for speed and simplicity.
        </p>

        {/* Architecture Section */}
        <div style={{ marginBottom: '22px' }}>
          <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600 }}>
            Architecture
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              <span style={{ color: 'var(--accent)', marginTop: '2px' }}>•</span>
              <div>
                <a
                  href="https://github.com/guru-jadhav/CacheCore"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', borderBottom: '1px dotted var(--accent)' }}
                  title="View CacheCore repository"
                >
                  CacheCore
                </a>
                {' '}— Custom C++ in-memory TCP cache layer (:6948) for rapid redirect lookups.
              </div>
            </li>

            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              <span style={{ color: 'var(--accent)', marginTop: '2px' }}>•</span>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Backend</strong> — Java 25 &amp; Spring Boot 3 with PostgreSQL.
              </div>
            </li>

            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              <span style={{ color: 'var(--accent)', marginTop: '2px' }}>•</span>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Frontend</strong> — Lightweight React 19 + Vite SPA.
              </div>
            </li>

            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              <span style={{ color: 'var(--accent)', marginTop: '2px' }}>•</span>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Auth</strong> — Passwordless sign-in with email OTP.
              </div>
            </li>
          </ul>
        </div>

        {/* Contact & Feedback Box */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 18px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Mail size={16} style={{ color: 'var(--accent)' }} />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Contact &amp; Feedback</span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.45 }}>
            Have questions, feedback, or found an issue?
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 12px',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.825rem', color: 'var(--text-primary)' }}>
              {contactEmail}
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '5px 9px', fontSize: '0.75rem' }}
                onClick={handleCopyEmail}
                title="Copy email to clipboard"
              >
                {copied ? <Check size={13} style={{ color: 'var(--success)' }} /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <a
                href={`mailto:${contactEmail}`}
                className="btn btn-primary"
                style={{ padding: '5px 10px', fontSize: '0.75rem', textDecoration: 'none' }}
              >
                Send Email
              </a>
            </div>
          </div>
        </div>

        {/* GitHub Link */}
        <div style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Star or contribute on{' '}
          <a
            href="https://github.com/guru-jadhav/atomurl"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}
          >
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
