import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  onClose: () => void;
  defaultTab?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, defaultTab = 'login' }) => {
  const { login, signup } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup'>(defaultTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = tab === 'login'
      ? await login(email, password)
      : await signup(name, email, password);
    setLoading(false);
    if (result.ok) {
      onClose();
    } else {
      setError(result.error || 'Something went wrong.');
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box auth-modal" role="dialog" aria-modal="true" aria-label="Authentication">
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="auth-modal-header">
          <span className="auth-modal-logo">🎓</span>
          <h2>{tab === 'login' ? 'Welcome back' : 'Join CollegeFind'}</h2>
          <p>{tab === 'login' ? 'Sign in to save colleges and comparisons' : 'Create an account to get started'}</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'auth-tab-active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>Sign In</button>
          <button className={`auth-tab ${tab === 'signup' ? 'auth-tab-active' : ''}`} onClick={() => { setTab('signup'); setError(''); }}>Sign Up</button>
        </div>

        <form onSubmit={submit} className="auth-form">
          {tab === 'signup' && (
            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name" type="text" className="auth-input"
                placeholder="Rahul Sharma" value={name}
                onChange={e => setName(e.target.value)} required autoFocus
              />
            </div>
          )}
          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-email">Email</label>
            <input
              id="auth-email" type="email" className="auth-input"
              placeholder="you@example.com" value={email}
              onChange={e => setEmail(e.target.value)} required
              autoFocus={tab === 'login'}
            />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-pw">Password</label>
            <div className="auth-pw-wrap">
              <input
                id="auth-pw" type={showPwd ? 'text' : 'password'} className="auth-input"
                placeholder={tab === 'signup' ? 'Min. 6 characters' : '••••••••'}
                value={password} onChange={e => setPassword(e.target.value)} required
              />
              <button type="button" className="auth-pw-toggle" onClick={() => setShowPwd(v => !v)}>
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn btn-primary btn-lg auth-submit-btn" disabled={loading}>
            {loading ? 'Please wait…' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button className="auth-switch-btn" onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setError(''); }}>
            {tab === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};
