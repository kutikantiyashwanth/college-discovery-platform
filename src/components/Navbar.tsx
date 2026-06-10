import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';

interface NavbarProps {
  compareCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ compareCount }) => {
  const location = useLocation();
  const { user, logout, savedColleges } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const links = [
    { to: '/colleges', label: 'Colleges' },
    { to: '/compare', label: compareCount > 0 ? `Compare (${compareCount})` : 'Compare', highlight: compareCount > 0 },
    { to: '/predictor', label: 'Predictor' },
    { to: '/discussions', label: 'Discuss' },
  ];

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const openLogin = () => { setAuthTab('login'); setShowAuth(true); setMenuOpen(false); };
  const openSignup = () => { setAuthTab('signup'); setShowAuth(true); setMenuOpen(false); };

  return (
    <>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultTab={authTab} />}

      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
            <span className="logo-icon">🎓</span>
            <span className="logo-text">CollegeFind</span>
          </Link>

          <div className="navbar-links desktop-only">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link
                  ${isActive(link.to) ? 'nav-link-active' : ''}
                  ${link.highlight ? 'nav-link-compare' : ''}
                `}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="navbar-right desktop-only">
            {user ? (
              <div className="user-menu-wrap" ref={userMenuRef}>
                <button
                  className="user-menu-trigger"
                  onClick={() => setUserMenuOpen(v => !v)}
                  aria-expanded={userMenuOpen}
                >
                  <span className="user-avatar">{user.avatar}</span>
                  <span className="user-name">{user.name.split(' ')[0]}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <span className="user-avatar user-avatar-lg">{user.avatar}</span>
                      <div>
                        <p className="ud-name">{user.name}</p>
                        <p className="ud-email">{user.email}</p>
                      </div>
                    </div>
                    <div className="user-dropdown-body">
                      <Link to="/saved" className="ud-link" onClick={() => setUserMenuOpen(false)}>
                        <span>🔖</span> Saved Colleges
                        {savedColleges.length > 0 && <span className="ud-badge">{savedColleges.length}</span>}
                      </Link>
                      <Link to="/saved" className="ud-link" onClick={() => setUserMenuOpen(false)}>
                        <span>⚖️</span> Saved Comparisons
                      </Link>
                    </div>
                    <div className="user-dropdown-footer">
                      <button className="ud-logout" onClick={() => { logout(); setUserMenuOpen(false); }}>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-btns">
                <button className="btn btn-ghost btn-sm" onClick={openLogin}>Sign In</button>
                <button className="btn btn-primary btn-sm" onClick={openSignup}>Sign Up</button>
              </div>
            )}
          </div>

          <button
            className="menu-toggle mobile-only"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className={`hamburger ${menuOpen ? 'open' : ''}`} />
          </button>
        </div>

        {menuOpen && (
          <div className="mobile-menu">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`mobile-nav-link ${isActive(link.to) ? 'nav-link-active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mobile-menu-divider" />
            {user ? (
              <>
                <Link to="/saved" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                  🔖 Saved Items
                </Link>
                <button className="mobile-nav-link mobile-logout" onClick={() => { logout(); setMenuOpen(false); }}>
                  Sign Out
                </button>
              </>
            ) : (
              <div className="mobile-auth-btns">
                <button className="btn btn-outline" onClick={openLogin}>Sign In</button>
                <button className="btn btn-primary" onClick={openSignup}>Sign Up</button>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
};
