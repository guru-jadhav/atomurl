import React, { useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { X, User, Mail, Shield, Check, Clock } from 'lucide-react';

export default function ProfileModal({ onClose, onShowToast }) {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [nameLoading, setNameLoading] = useState(false);

  // Email update state
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [emailStep, setEmailStep] = useState(1); // 1 = enter new email, 2 = enter OTP
  const [emailLoading, setEmailLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setNameLoading(true);
    try {
      await api.updateName(name.trim());
      await refreshUser();
      onShowToast('Display name updated successfully');
    } catch (err) {
      onShowToast(err.message || 'Failed to update name', 'error');
    } finally {
      setNameLoading(false);
    }
  };

  const handleSendEmailOtp = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setEmailLoading(true);
    try {
      await api.sendEmailChangeOtp(newEmail.trim());
      setEmailStep(2);
      setCooldown(30);
      const timer = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
      onShowToast('Verification OTP sent to new email');
    } catch (err) {
      onShowToast(err.message || 'Failed to send OTP', 'error');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return;
    setEmailLoading(true);
    try {
      await api.validateEmailChangeOtp(newEmail.trim(), otp.trim());
      await refreshUser();
      onShowToast('Email address successfully changed!');
      setEmailStep(1);
      setNewEmail('');
      setOtp('');
    } catch (err) {
      onShowToast(err.message || 'Failed to verify OTP', 'error');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '1.25rem' }}>Account Profile</h3>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Profile Info */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Email</span>
            <span style={{
              fontWeight: 500,
              maxWidth: '220px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'inline-block',
              verticalAlign: 'middle'
            }} title={user?.email}>
              {user?.email}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Provider</span>
            <span className="badge badge-accent">{user?.signinProvider}</span>
          </div>
        </div>

        {/* Update Name Form */}
        <form onSubmit={handleUpdateName} style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Display Name</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="input-text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter display name..."
              maxLength={100}
            />
            <button type="submit" className="btn btn-primary" disabled={nameLoading || !name.trim()}>
              {nameLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>

        {/* Update Email Form (Only enabled for EMAIL provider) */}
        {user?.signinProvider === 'EMAIL' ? (
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Change Email Address</label>
            {emailStep === 1 ? (
              <form onSubmit={handleSendEmailOtp} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  className="input-text"
                  placeholder="Enter new email..."
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  disabled={emailLoading}
                />
                <button type="submit" className="btn btn-secondary" disabled={emailLoading || !newEmail.trim()}>
                  {emailLoading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyEmailOtp} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Enter code sent to <strong>{newEmail}</strong>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="input-text"
                    placeholder="6-digit OTP..."
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    style={{ fontFamily: 'var(--font-mono)', letterSpacing: '2px' }}
                  />
                  <button type="submit" className="btn btn-primary" disabled={emailLoading || !otp.trim()}>
                    Verify
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
            Email managed by {user?.signinProvider} SSO (cannot be edited).
          </div>
        )}

        {/* Support Contact */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>Need help or support?</span>
          <a href="mailto:atomurl.app@gmail.com" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
            atomurl.app@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
