import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api';
import { Alert, Spinner, StatusBadge } from '../components/common';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.new_password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.new_password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authApi.changePassword({ current_password: form.current_password, new_password: form.new_password });
      toast.success('Password changed successfully');
      setForm({ current_password: '', new_password: '', confirm: '' });
      setShowForm(false);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">My Profile</div>
          <div className="page-subtitle">Your account information</div>
        </div>
      </div>

      <div className="two-col-grid">
        <div className="card">
          <div className="card-header"><h3 className="card-title">Account Details</h3></div>
          <div className="detail-grid">
            <div>
              <div className="detail-label">Name</div>
              <div className="detail-value">{user.first_name} {user.last_name}</div>
            </div>
            <div>
              <div className="detail-label">Email</div>
              <div className="detail-value">{user.email}</div>
            </div>
            <div>
              <div className="detail-label">Employee ID</div>
              <div className="detail-value">{user.employee_id || '—'}</div>
            </div>
            <div>
              <div className="detail-label">Role</div>
              <div className="detail-value"><StatusBadge status={user.role} /></div>
            </div>
            <div>
              <div className="detail-label">Phone</div>
              <div className="detail-value">{user.phone || '—'}</div>
            </div>
            <div>
              <div className="detail-label">Status</div>
              <div className="detail-value">
                <StatusBadge status={user.is_active ? 'active' : 'cancelled'} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Change Password</h3>
            {!showForm && (
              <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(true)}>
                Change
              </button>
            )}
          </div>
          {showForm && (
            <form onSubmit={handleChangePassword}>
              {error && <Alert message={error} />}
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input className="form-control" type="password" value={form.current_password}
                  onChange={(e) => setForm({ ...form, current_password: e.target.value })}
                  required autoComplete="current-password" />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-control" type="password" value={form.new_password}
                  onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                  required minLength={8} autoComplete="new-password" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input className="form-control" type="password" value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  required autoComplete="new-password" />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? <Spinner size={14} /> : 'Update Password'}
                </button>
                <button className="btn btn-secondary" type="button"
                  onClick={() => { setShowForm(false); setError(''); }}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
