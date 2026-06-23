
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import { Alert, Spinner } from '../components/common';
import AuthBrandPanel from '../components/common/AuthBrandPanel';
import type { RegisterRequest } from '../types';
import toast from 'react-hot-toast';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterRequest>({
    first_name: '', last_name: '', email: '', password: '',
    phone: '', role: 'employee',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof RegisterRequest>(k: K, v: RegisterRequest[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await authApi.register(form);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-shell">
      <AuthBrandPanel
        title="Get your team moving in minutes."
        subtitle="Set up your workspace, invite your team, and start tracking sprints, tasks and leave from a single, organized dashboard."
        features={[
          'Department, team and project structure built in',
          'Task assignment with full reassignment history',
          'Notifications the moment work moves',
        ]}
      />

      <div className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-mobile-logo">
            <img src="https://res.cloudinary.com/dw9kvnkkz/image/upload/v1782212001/full_logo_gtiszq.png"
              alt="SprintFlow" style={{ height: 36, objectFit: 'contain' }} />
          </div>

          <div className="auth-form-header">
            <h2>Create your account</h2>
            <p>Join your team's workspace.</p>
          </div>

          {error && <Alert type="error" message={error} />}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First name</label>
                <input className="form-control" value={form.first_name} onChange={(e) => set('first_name', e.target.value)} required minLength={2} />
              </div>
              <div className="form-group">
                <label className="form-label">Last name</label>
                <input className="form-control" value={form.last_name} onChange={(e) => set('last_name', e.target.value)} required minLength={2} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} required minLength={8} autoComplete="new-password" />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-control" value={form.role} onChange={(e) => set('role', e.target.value as 'employee' | 'scrum_master')}>
                <option value="employee">Employee</option>
                <option value="scrum_master">Scrum Master</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Phone (optional)</label>
              <input className="form-control" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? <Spinner size={16} /> : 'Create account'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;