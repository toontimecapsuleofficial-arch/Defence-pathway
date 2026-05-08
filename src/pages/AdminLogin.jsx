import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './AdminLogin.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError('Invalid credentials. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page tac-grid">
      <div className="admin-login-box corner-accent">
        <div className="login-icon">🔐</div>
        <div className="font-mono text-muted mb-2" style={{ letterSpacing: '0.3em', fontSize: '0.7rem' }}>
          RESTRICTED ACCESS
        </div>
        <h2 className="login-title">ADMIN PANEL</h2>
        <p className="text-secondary mb-3" style={{ fontSize: '0.9rem' }}>
          Authorised personnel only
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@defencepathway.in"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            style={{ justifyContent: 'center', marginTop: '0.5rem' }}
          >
            {loading ? 'AUTHENTICATING...' : 'ENTER COMMAND CENTRE'}
          </button>
        </form>

        <div className="login-footer font-mono">
          DEFENCE PATHWAY — SECURE ADMIN ACCESS
        </div>
      </div>
    </div>
  );
}
