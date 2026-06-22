import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, FolderKanban, Zap, CalendarOff, CheckSquare, AlertTriangle, TrendingUp, Shield, BarChart3 } from 'lucide-react';
import { dashboardApi } from '../api';
import { useApi } from '../hooks/useApi';
import { Alert, ProgressBar } from '../components/common';
import type { AdminDashboard as AdminDashboardType } from '../types';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#0EA5E9'];

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'var(--success)';
  if (score >= 50) return 'var(--primary)';
  if (score >= 20) return 'var(--warning)';
  return 'var(--text-muted)';
};

const getScoreBg = (score: number): string => {
  if (score >= 80) return 'var(--success-subtle)';
  if (score >= 50) return 'var(--primary-subtle)';
  if (score >= 20) return 'var(--warning-subtle)';
  return 'var(--bg-elevated)';
};

const StatCard: React.FC<{ label: string; value: number | string; icon: React.ReactNode; color: string; note?: string }> = ({ label, value, icon, color, note }) => (
  <div className={`stat-card ${color}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
    {note && <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>{note}</div>}
  </div>
);

const Skeleton: React.FC<{ width?: string; height?: string }> = ({ width = '100%', height = '16px' }) => (
  <div style={{ width, height, borderRadius: 6, background: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--border) 50%, var(--bg-elevated) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s ease infinite' }} />
);

const AdminDashboard: React.FC = () => {
  const { data, loading, error } = useApi<AdminDashboardType>(() => dashboardApi.admin());

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div><Skeleton width="200px" height="28px" /><div style={{ marginTop: 8 }}><Skeleton width="300px" height="14px" /></div></div>
        </div>
        <div className="stats-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="stat-card"><Skeleton width="40px" height="36px" /><div style={{ marginTop: 12 }}><Skeleton width="60px" height="28px" /></div><div style={{ marginTop: 6 }}><Skeleton width="80px" height="12px" /></div></div>
          ))}
        </div>
        <div className="dashboard-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card"><Skeleton height="200px" /></div>
          ))}
        </div>
      </div>
    );
  }
  if (error)   return <Alert message={error} />;
  if (!data)   return null;

  const { overview, projects_by_status, top_performers } = data;
  const completionRate = overview.total_tasks
    ? Math.round((overview.completed_tasks / overview.total_tasks) * 100)
    : 0;

  const chartData = projects_by_status.map((d) => ({
    ...d,
    count: parseInt(d.count, 10) || 0,
  }));
  const totalProjects = chartData.reduce((s, d) => s + d.count, 0);

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Admin Dashboard</div>
          <div className="page-subtitle">Organization-wide overview &amp; performance metrics</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--success-subtle)', border: '1px solid rgba(16,185,129,.18)', borderRadius: 'var(--radius)' }}>
          <Shield size={14} style={{ color: 'var(--success)' }} />
          <span style={{ fontSize: '.8125rem', fontWeight: 600, color: 'var(--success-text)' }}>Admin Access</span>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Employees"  value={overview.total_employees}  icon={<Users size={18} />}       color="accent"  />
        <StatCard label="Total Projects"   value={overview.total_projects}   icon={<FolderKanban size={18} />} color="success" />
        <StatCard label="Active Sprints"   value={overview.active_sprints}   icon={<Zap size={18} />}          color="purple"  />
        <StatCard label="Pending Leaves"   value={overview.pending_leaves}   icon={<CalendarOff size={18} />}  color="warning" />
        <StatCard label="Total Tasks"      value={overview.total_tasks}      icon={<CheckSquare size={18} />}  color="accent"  />
        <StatCard label="Completed Tasks"  value={overview.completed_tasks}  icon={<TrendingUp size={18} />}   color="success" />
        <StatCard label="Blocked Tasks"    value={overview.blocked_tasks}    icon={<AlertTriangle size={18} />} color="danger" />
        <StatCard label="Delayed Tasks"    value={overview.delayed_tasks}    icon={<AlertTriangle size={18} />} color="warning" />
      </div>

      <div className="dashboard-grid">

        {/* Projects by Status — donut */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Projects by Status</h3>
            <span className="badge badge-blue">{totalProjects} total</span>
          </div>
          {chartData.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 24px' }}>
              <BarChart3 size={64} />
              <p>No projects yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%" cy="50%"
                  innerRadius={56}
                  outerRadius={88}
                  paddingAngle={chartData.length > 1 ? 3 : 0}
                  stroke="none"
                  animationBegin={100}
                  animationDuration={600}
                  animationEasing="ease-out"
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', fontSize: '.8125rem' }}
                  formatter={(value: number) => [value, 'Projects']}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '.8125rem', color: 'var(--text-secondary)', paddingTop: 8 }}
                  formatter={(value: string) => (
                    <span style={{ textTransform: 'capitalize' }}>{value.replace(/_/g, ' ')}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Performers */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Top Performers</h3>
            <span className="badge badge-green">Productivity</span>
          </div>
          {top_performers.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 24px' }}>
              <TrendingUp size={64} />
              <p>No performance data yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {top_performers.map((p, i) => {
                const score = parseFloat(p.productivity_score);
                return (
                  <div key={i} style={{ animation: `fadeIn .3s ease ${i * 0.07}s both` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: getScoreBg(score),
                            color: getScoreColor(score),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: '.6875rem',
                            flexShrink: 0,
                          }}
                        >
                          {p.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '.875rem' }}>{p.name}</span>
                      </div>
                      <span style={{ color: getScoreColor(score), fontWeight: 700, fontSize: '.875rem' }}>
                        {score}%
                      </span>
                    </div>
                    <ProgressBar value={score} color={getScoreColor(score)} />
                    <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: 5, display: 'flex', justifyContent: 'space-between' }}>
                      <span>{p.total_tasks_completed} tasks completed</span>
                      {score > 0 && <span style={{ fontWeight: 500 }}>#{i + 1}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Task breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Task Breakdown</h3>
            <span className="badge badge-purple">{completionRate}% done</span>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '.875rem', color: 'var(--text-secondary)' }}>Overall completion</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{completionRate}%</span>
            </div>
            <ProgressBar value={completionRate} />
          </div>
          <div className="two-col-grid" style={{ gap: 10 }}>
            {[
              { l: 'Total',     v: overview.total_tasks,      c: 'var(--primary)' },
              { l: 'Completed', v: overview.completed_tasks,  c: 'var(--success)' },
              { l: 'Blocked',   v: overview.blocked_tasks,    c: 'var(--danger)' },
              { l: 'Delayed',   v: overview.delayed_tasks,    c: 'var(--warning)' },
            ].map((x) => (
              <div key={x.l} style={{ padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', borderLeft: `3px solid ${x.c}` }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: x.c }}>{x.v}</div>
                <div style={{ fontSize: '.75rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 2 }}>{x.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Org Overview */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Organisation Overview</h3></div>
          <div className="two-col-grid" style={{ gap: 10 }}>
            {[
              { l: 'Teams',         v: overview.total_teams,     c: 'var(--primary)' },
              { l: 'Employees',     v: overview.total_employees, c: 'var(--success)' },
              { l: 'Projects',      v: overview.total_projects,  c: 'var(--purple)' },
              { l: 'Active Sprints',v: overview.active_sprints,  c: 'var(--warning)' },
            ].map((x) => (
              <div key={x.l} style={{ padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', borderLeft: `3px solid ${x.c}` }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: x.c }}>{x.v}</div>
                <div style={{ fontSize: '.75rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 2 }}>{x.l}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
