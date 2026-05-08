import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';
import './Layout.css';

const NAV_ITEMS = [
  { path: '/gd', label: 'GD', icon: '💬', title: 'Group Discussion' },
  { path: '/ppdt', label: 'PP&DT', icon: '🖼️', title: 'Picture Perception' },
  { path: '/gto', label: 'GTO', icon: '🪖', title: 'Group Task Obstacles' },
  { path: '/wat', label: 'WAT', icon: '✍️', title: 'Word Association Test' },
  { path: '/srt', label: 'SRT', icon: '⚡', title: 'Situation Reaction Test' },
  { path: '/lecturette', label: 'LECT', icon: '🎤', title: 'Lecturette' },
  { path: '/meet', label: 'MEET', icon: '📅', title: 'Live Sessions' },
  { path: '/youtube', label: 'VIDEOS', icon: '📺', title: 'Training Videos' },
];

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();

  const filteredNav = NAV_ITEMS.filter(item => {
    if (item.path === '/lecturette' && !settings.lecturetteVisible) return false;
    if (item.path === '/meet' && !settings.meetVisible) return false;
    if (item.path === '/youtube' && !settings.youtubeVisible) return false;
    return true;
  });

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="layout">
      <header className="navbar">
        <div className="container nav-inner">
          <Link to="/" className="brand">
            <span className="brand-icon">🎖️</span>
            <div>
              <span className="brand-name">DEFENCE</span>
              <span className="brand-sub">PATHWAY</span>
            </div>
          </Link>

          <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
            {filteredNav.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                title={item.title}
                onClick={() => setMenuOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
            {user && isAdmin && (
              <Link
                to="/admin"
                className={`nav-link admin-link ${location.pathname === '/admin' ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <span className="nav-icon">⚙️</span>
                <span className="nav-label">ADMIN</span>
              </Link>
            )}
          </nav>

          <div className="nav-actions">
            {user ? (
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">LOGOUT</button>
            ) : (
              <Link to="/admin/login" className="btn btn-ghost btn-sm">ADMIN</Link>
            )}
            <button
              className={`menu-toggle ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">
          <p className="text-muted font-mono" style={{ fontSize: '0.8rem', textAlign: 'center', letterSpacing: '0.15em' }}>
            DEFENCE PATHWAY — SSB EXCELLENCE TRAINING PLATFORM © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
