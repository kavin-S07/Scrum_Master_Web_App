import React from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi, leavesApi } from '../api';
import { useApi } from '../hooks/useApi';
import { LoadingCenter, Alert, ProgressBar, StatusBadge } from '../components/common';
import type { ScrumMasterDashboard as SMDash } from '../types';
import toast from 'react-hot-toast';

const ScrumMasterDashboard: React.FC = () => {
  const { data, loading, error, refetch } = useApi<SMDash>(() => dashboardApi.scrumMaster());

  const handleLeaveDecision = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await leavesApi.decision(id, { status });
      toast.success(`Leave ${status}`);
      refetch();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <LoadingCenter />;
  if (error) return <Alert message={error} />;
  if (!data) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Scrum Master Dashboard</div>
          <div className="page-subtitle">Team & sprint overview</div>
        </div>
      </div>

      {/* Task Overview */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { l: 'Total Tasks', v: data.task_overview.total_tasks, c: 'var(--accent)' },
          { l: 'Blocked', v: data.task_overview.blocked_tasks, c: 'var(--danger)' },
          { l: 'Overdue', v: data.task_overview.overdue_tasks, c: 'var(--warning)' },
          { l: 'Active Sprints', v: data.active_sprints.length, c: 'var(--success)' },
        ].map((x) => (
          <div key={x.l} className="stat-card">
            <div className="stat-value" style={{ color: x.c }}>{x.v}</div>
            <div className="stat-label">{x.l}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Active Sprints */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Active Sprints</h3>
            <Link to="/sprints" className="btn btn-ghost btn-sm">View all</Link>
          </div>
          {data.active_sprints.length === 0
            ? <p style={{ color: 'var(--text-muted)' }}>No active sprints</p>
            : data.active_sprints.map((s) => (
              <div key={s.id} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 500 }}>{s.sprint_name}</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{parseFloat(s.progress_percent).toFixed(0)}%</span>
                </div>
                <ProgressBar value={parseFloat(s.progress_percent)} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  <span>{s.completed_tasks}/{s.total_tasks} tasks</span>
                  <span>Ends {s.end_date}</span>
                </div>
              </div>
            ))}
        </div>

        {/* Pending Leaves */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Pending Leaves</h3>
            <Link to="/leaves" className="btn btn-ghost btn-sm">View all</Link>
          </div>
          {data.pending_leaves.length === 0
            ? <p style={{ color: 'var(--text-muted)' }}>No pending leaves</p>
            : data.pending_leaves.map((l) => (
              <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, padding: '10px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '.875rem' }}>{l.employee_name}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text-secondary)' }}>
                    {l.leave_type} · {l.start_date} → {l.end_date}
                  </div>
                </div>
                <button className="btn btn-sm" style={{ background: 'var(--success-subtle)', color: 'var(--success)' }}
                  onClick={() => handleLeaveDecision(l.id, 'approved')}>Approve</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleLeaveDecision(l.id, 'rejected')}>Reject</button>
              </div>
            ))}
        </div>

        {/* Blocked Tasks */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <h3 className="card-title">Blocked Tasks</h3>
            <Link to="/tasks?status=blocked" className="btn btn-ghost btn-sm">View all</Link>
          </div>
          {data.blocked_tasks.length === 0
            ? <p style={{ color: 'var(--text-muted)' }}>No blocked tasks</p>
            : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr><th>Task</th><th>Assigned To</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {data.blocked_tasks.map((t) => (
                      <tr key={t.id}>
                        <td>{t.title}</td>
                        <td>{t.assigned_to}</td>
                        <td><StatusBadge status="blocked" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ScrumMasterDashboard;