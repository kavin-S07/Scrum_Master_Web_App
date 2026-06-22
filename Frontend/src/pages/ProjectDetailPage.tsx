import React, { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, GitBranch, CheckSquare, BarChart3 } from 'lucide-react';
import { projectsApi, teamsApi, sprintsApi, tasksApi } from '../api';
import { useApi } from '../hooks/useApi';
import {
  LoadingCenter,
  Alert,
  EmptyState,
  StatusBadge,
} from '../components/common';
import type { Project, Team, Sprint, Task } from '../types';
import { useAuth } from '../context/AuthContext';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: project, loading: loadingProj, error: errorProj } = useApi<Project>(
    useCallback(() => id ? projectsApi.get(id) : Promise.resolve({ data: { data: null as unknown as Project } }), [id])
  );

  const { data: teamsRaw, loading: loadingTeams } = useApi<Team[]>(
    useCallback(() => id ? projectsApi.teams(id).then((r) => ({ data: { data: r.data.data } })) : Promise.resolve({ data: { data: [] as Team[] } }), [id])
  );
  const teams = teamsRaw || [];

  const { data: sprintsData, loading: loadingSprints } = useApi<Sprint[]>(
    useCallback(() => id ? sprintsApi.listByProject(id).then((r) => ({ data: { data: r.data.data } })) : Promise.resolve({ data: { data: [] as Sprint[] } }), [id])
  );
  const sprints = sprintsData || [];

  const { data: tasksData, loading: loadingTasks } = useApi<Task[]>(
    useCallback(
      () => id
        ? tasksApi.list({ project_id: id, limit: 200 }).then((r) => ({
            data: { data: r.data.data, pagination: r.data.pagination },
          }))
        : Promise.resolve({ data: { data: [] as Task[] } }),
      [id]
    )
  );
  const tasks = tasksData || [];

  const loading = loadingProj || loadingTeams || loadingSprints || loadingTasks;
  const error = errorProj;

  // Compute task stats
  const totalTasks = tasks.length;
  const statusCounts = tasks.reduce(
    (acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const completedTasks = statusCounts.completed || 0;
  const blockedTasks = statusCounts.blocked || 0;
  const inProgressTasks = statusCounts.in_progress || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Active sprint
  const activeSprint = sprints.find((s) => s.sprint_status === 'active');

  if (loading) return <LoadingCenter />;
  if (error) return <Alert message={error} />;
  if (!project) return <Alert message="Project not found" />;

  const fmt = (d: string) =>
    d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/projects')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="page-title">{project.project_name}</div>
            <div className="page-subtitle">{project.project_code} · {project.created_by_name || '—'}</div>
          </div>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="stat-card accent">
          <div className="stat-icon" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}><Users size={20} /></div>
          <div className="stat-value">{teams.length}</div>
          <div className="stat-label">Teams</div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon" style={{ background: 'var(--success-subtle)', color: 'var(--success)' }}><GitBranch size={20} /></div>
          <div className="stat-value">{sprints.length}</div>
          <div className="stat-label">Sprints</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon" style={{ background: '#F3E8FF', color: '#9333EA' }}><CheckSquare size={20} /></div>
          <div className="stat-value">{totalTasks}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon" style={{ background: '#FEF3C7', color: '#D97706' }}><BarChart3 size={20} /></div>
          <div className="stat-value">{progress}%</div>
          <div className="stat-label">Progress</div>
        </div>
      </div>

      <div className="two-col-grid">
        {/* Project Info */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Project Details</h3></div>
          <div className="detail-grid">
            <div>
              <div className="detail-label">Description</div>
              <div className="detail-value">{project.description || 'No description'}</div>
            </div>
            <div>
              <div className="detail-label">Code</div>
              <div className="detail-value" style={{ fontFamily: 'var(--font-mono)' }}>{project.project_code}</div>
            </div>
            <div>
              <div className="detail-label">Start Date</div>
              <div className="detail-value">{fmt(project.start_date)}</div>
            </div>
            <div>
              <div className="detail-label">End Date</div>
              <div className="detail-value">{fmt(project.end_date)}</div>
            </div>
            <div>
              <div className="detail-label">Created By</div>
              <div className="detail-value">{project.created_by_name || '—'}</div>
            </div>
            <div>
              <div className="detail-label">Status</div>
              <div className="detail-value"><StatusBadge status={project.status} /></div>
            </div>
          </div>
        </div>

        {/* Task Stats */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Task Statistics</h3></div>
          <div style={{ marginBottom: 16 }}>
            <div className="progress-bar" style={{ height: 12, borderRadius: 6 }}>
              <div className="progress-bar-fill" style={{
                width: `${progress}%`,
                background: 'var(--success)',
                borderRadius: 6,
                height: 12,
              }} />
            </div>
            <div style={{ textAlign: 'right', fontSize: '.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              {completedTasks}/{totalTasks} completed
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div className="stat-card" style={{ padding: 12 }}>
              <div className="stat-value" style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{statusCounts.todo || 0}</div>
              <div className="stat-label">To Do</div>
            </div>
            <div className="stat-card" style={{ padding: 12 }}>
              <div className="stat-value" style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>{inProgressTasks}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="stat-card" style={{ padding: 12 }}>
              <div className="stat-value" style={{ fontSize: '1.25rem', color: 'var(--success)' }}>{completedTasks}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card" style={{ padding: 12 }}>
              <div className="stat-value" style={{ fontSize: '1.25rem', color: 'var(--danger)' }}>{blockedTasks}</div>
              <div className="stat-label">Blocked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sprints */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><h3 className="card-title"><GitBranch size={16} /> Sprints</h3></div>
        {sprints.length === 0 ? (
          <EmptyState message="No sprints for this project" />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Sprint</th>
                  <th>Goal</th>
                  <th>Dates</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sprints.map((s) => (
                  <tr key={s.id} style={s.id === activeSprint?.id ? { background: 'var(--accent-subtle)' } : undefined}>
                    <td style={{ fontWeight: 500 }}>
                      {s.sprint_name}
                      {s.id === activeSprint?.id && <StatusBadge status="active" />}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.goal || '—'}
                    </td>
                    <td style={{ fontSize: '.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {fmt(s.start_date)} → {fmt(s.end_date)}
                    </td>
                    <td><StatusBadge status={s.sprint_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Teams */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><h3 className="card-title"><Users size={16} /> Teams</h3></div>
        {teams.length === 0 ? (
          <EmptyState message="No teams assigned to this project" />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Department</th>
                  <th>Scrum Master</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 500 }}>{t.team_name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{t.department_name || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{t.scrum_master_name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
