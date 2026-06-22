import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert, Spinner } from '../components/common';
import AuthBrandPanel from '../components/common/AuthBrandPanel';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect to the page the user was trying to reach, or dashboard
  const from = (location.state as { from?: string })?.from || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(form.email.trim().toLowerCase(), form.password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <AuthBrandPanel
        title="Manage sprints, teams and leave — all in one place."
        subtitle="SprintFlow helps your engineering org stay in sync with clear sprint tracking, smart task reassignment, and real-time notifications."
        features={[
          'Role-based dashboards for Admin, Scrum Master & Employee',
          'Automated task reassignment on approved leave',
          'Real-time notifications via WebSocket',
        ]}
      />

      <div className="auth-form-panel">
        <div className="auth-form-card">
          {/* Mobile-only logo (brand panel is hidden on small screens) */}
          <div className="auth-mobile-logo">
            <div className="sidebar-logo-icon">SF</div>
            <span className="sidebar-logo-text">Sprint<span>Flow</span></span>
          </div>

          <div className="auth-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue.</p>
          </div>

          {error && <Alert type="error" message={error} />}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                className="form-control"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                className="form-control"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
                required
              />
            </div>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
            >
              {loading ? <Spinner size={16} /> : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            Don&apos;t have an account? <Link to="/register">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;