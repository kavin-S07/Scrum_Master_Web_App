
import React from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api';
import { useApi } from '../hooks/useApi';
import { LoadingCenter, Alert, StatusBadge, ProgressBar } from '../components/common';
import type { EmployeeDashboard as EmpDash } from '../types';

const EmployeeDashboard: React.FC = () => {
  const { data, loading, error } = useApi<EmpDash>(() => dashboardApi.employee());

  if (loading) return <LoadingCenter />;
  if (error) return <Alert message={error} />;
  if (!data) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">My Dashboard</div>
          <div className="page-subtitle">Your personal work summary</div>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { l: 'Completed Tasks', v: data.completed_tasks_count, c: 'var(--success)' },
          { l: 'Pending Tasks', v: data.pending_tasks.length, c: 'var(--accent)' },
          { l: "Today's Tasks", v: data.today_tasks.length, c: 'var(--warning)' },
          { l: 'Hours This Month', v: parseFloat(data.work_hours_this_month).toFixed(1) + 'h', c: 'var(--purple)' },
        ].map((x) => (
          <div key={x.l} className="stat-card">
            <div className="stat-value" style={{ color: x.c }}>{x.v}</div>
            <div className="stat-label">{x.l}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Pending Tasks */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Pending Tasks</h3>
            <Link to="/tasks" className="btn btn-ghost btn-sm">View all</Link>
          </div>
          {data.pending_tasks.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: '.875rem' }}>All caught up!</p>
            : data.pending_tasks.slice(0, 5).map((t) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, padding: '10px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: '.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                  {t.due_date && <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Due {t.due_date}</div>}
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))}
        </div>

        {/* Sprint Progress */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Sprint Progress</h3></div>
          {data.sprint_progress.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: '.875rem' }}>No active sprints</p>
            : data.sprint_progress.map((s, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 500, fontSize: '.875rem' }}>{s.sprint_name}</span>
                  <span style={{ fontSize: '.8125rem', color: 'var(--text-secondary)' }}>
                    {s.completed_tasks}/{s.total_tasks}
                  </span>
                </div>
                <ProgressBar value={s.completed_tasks} max={s.total_tasks || 1} />
              </div>
            ))}
        </div>

        {/* Recent Leaves */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <h3 className="card-title">Recent Leave Requests</h3>
            <Link to="/leaves" className="btn btn-ghost btn-sm">Manage</Link>
          </div>
          {data.recent_leaves.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: '.875rem' }}>No leave requests</p>
            : (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Type</th><th>Start</th><th>Status</th></tr></thead>
                  <tbody>
                    {data.recent_leaves.map((l) => (
                      <tr key={l.id}>
                        <td>{l.leave_type}</td>
                        <td>{l.start_date}</td>
                        <td><StatusBadge status={l.status} /></td>
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

export default EmployeeDashboard;