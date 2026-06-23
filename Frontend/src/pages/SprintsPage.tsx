import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Pencil, Trash2, TrendingDown, Zap } from 'lucide-react';
import { sprintsApi, projectsApi } from '../api';
import { useApi } from '../hooks/useApi';
import {
  LoadingCenter,
  Alert,
  Modal,
  EmptyState,
  StatusBadge,
  ConfirmModal,
  DetailModal,
} from '../components/common';
import type { Sprint, SprintStatus, Project, BurndownData } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const STATUSES: SprintStatus[] = ['planned', 'active', 'completed', 'cancelled'];

const SprintForm: React.FC<{
  initial?: Sprint;
  onSave: (d: Partial<Sprint>) => void;
  loading: boolean;
  projects: Project[];
  defaultProjectId?: string;
}> = ({ initial, onSave, loading, projects, defaultProjectId }) => {
  const [form, setForm] = useState({
    project_id: initial?.project_id || defaultProjectId || '',
    sprint_name: initial?.sprint_name || '',
    goal: initial?.goal || '',
    start_date: initial?.start_date?.slice(0, 10) || '',
    end_date: initial?.end_date?.slice(0, 10) || '',
    sprint_status: (initial?.sprint_status || 'planned') as SprintStatus,
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.end_date && form.start_date && form.end_date < form.start_date) {
      toast.error('End date must be on or after start date');
      return;
    }
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Project *</label>
        <select
          className="form-control"
          value={form.project_id}
          onChange={(e) => set('project_id', e.target.value)}
          required
        >
          <option value="">Select project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.project_name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Sprint Name *</label>
        <input
          className="form-control"
          value={form.sprint_name}
          onChange={(e) => set('sprint_name', e.target.value)}
          required
          minLength={2}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Goal</label>
        <textarea
          className="form-control"
          value={form.goal}
          onChange={(e) => set('goal', e.target.value)}
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Start Date *</label>
          <input
            className="form-control"
            type="date"
            value={form.start_date}
            onChange={(e) => set('start_date', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">End Date *</label>
          <input
            className="form-control"
            type="date"
            value={form.end_date}
            min={form.start_date}
            onChange={(e) => set('end_date', e.target.value)}
            required
          />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Status</label>
        <select
          className="form-control"
          value={form.sprint_status}
          onChange={(e) => set('sprint_status', e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Saving…' : initial ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

const BurndownModal: React.FC<{ sprintId: string; onClose: () => void }> = ({ sprintId, onClose }) => {
  const { data, loading } = useApi<BurndownData>(
    useCallback(() => sprintsApi.burndown(sprintId), [sprintId])
  );
  return (
    <Modal open title="Burndown Chart" onClose={onClose} maxWidth={600}>
      {loading ? (
        <LoadingCenter />
      ) : data ? (
        <div>
          <div style={{ marginBottom: 12 }}>
            <strong>{data.sprint.sprint_name}</strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '.875rem', marginLeft: 8 }}>
              {data.sprint.start_date} → {data.sprint.end_date} · {data.sprint.total_story_points} pts
            </span>
          </div>
          {data.burndown.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>
              No burndown data available yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.burndown}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="remaining_points"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={false}
                  name="Remaining"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      ) : (
        <Alert message="Could not load burndown data" />
      )}
    </Modal>
  );
};

const SprintsPage: React.FC = () => {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'scrum_master';
  const isAdmin = user?.role === 'admin';

  const { data: projectsData } = useApi<Project[]>(
    useCallback(() =>
      projectsApi.list({ limit: 100 }).then((r) => ({
        data: { data: r.data.data, pagination: r.data.pagination },
      })), [])
  );
  const projects = projectsData || [];

  const [selectedProject, setSelectedProject] = useState('');
  const [allSprints, setAllSprints] = useState<Sprint[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);

  // Fetch sprints for all projects on mount
  useEffect(() => {
    if (projects.length === 0) return;
    setLoadingAll(true);
    Promise.all(projects.map((p) => sprintsApi.listByProject(p.id).then((r) => r.data.data).catch(() => [] as Sprint[])))
      .then((results) => setAllSprints(results.flat()))
      .finally(() => setLoadingAll(false));
  }, [projects.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Per-project fetch when filter selected
  const [filteredSprints, setFilteredSprints] = useState<Sprint[] | null>(null);
  const [loadingFilter, setLoadingFilter] = useState(false);

  const handleProjectChange = async (projectId: string) => {
    setSelectedProject(projectId);
    if (!projectId) { setFilteredSprints(null); return; }
    setLoadingFilter(true);
    try {
      const res = await sprintsApi.listByProject(projectId);
      setFilteredSprints(res.data.data);
    } catch { setFilteredSprints([]); }
    finally { setLoadingFilter(false); }
  };

  const refetchAll = () => {
    if (projects.length === 0) return;
    setLoadingAll(true);
    Promise.all(projects.map((p) => sprintsApi.listByProject(p.id).then((r) => r.data.data).catch(() => [] as Sprint[])))
      .then((results) => setAllSprints(results.flat()))
      .finally(() => setLoadingAll(false));
    if (selectedProject) handleProjectChange(selectedProject);
  };

  const displaySprints = filteredSprints ?? allSprints;
  const loading = loadingAll || loadingFilter;

  const [modal, setModal] = useState<'create' | Sprint | null>(null);
  const [delTarget, setDelTarget] = useState<string | null>(null);
  const [detailTarget, setDetailTarget] = useState<Sprint | null>(null);
  const [burndownId, setBurndownId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (form: Partial<Sprint>) => {
    setSaving(true);
    try {
      if (modal === 'create') {
        await sprintsApi.create(form as Sprint);
      } else if (modal) {
        await sprintsApi.update((modal as Sprint).id, form);
      }
      toast.success(modal === 'create' ? 'Sprint created' : 'Sprint updated');
      setModal(null);
      refetchAll();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to save sprint');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!delTarget) return;
    setSaving(true);
    try {
      await sprintsApi.delete(delTarget);
      toast.success('Sprint deleted');
      setDelTarget(null);
      refetchAll();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to delete sprint');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Sprints</div>
          <div className="page-subtitle">
            {loading ? 'Loading…' : `${displaySprints.length} sprint${displaySprints.length !== 1 ? 's' : ''}${selectedProject ? ' in selected project' : ' across all projects'}`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select
            className="form-control"
            style={{ width: 210 }}
            value={selectedProject}
            onChange={(e) => handleProjectChange(e.target.value)}
          >
            <option value="">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.project_name}</option>
            ))}
          </select>
          {canEdit && (
            <button className="btn btn-primary" onClick={() => setModal('create')}>
              <Plus size={15} /> New Sprint
            </button>
          )}
        </div>
      </div>

      {loading && <LoadingCenter />}

      <div className="card">
        {!loading && displaySprints.length === 0 ? (
          <EmptyState
            icon={<Zap size={40} />}
            message={selectedProject ? 'No sprints for this project' : 'No sprints yet — create one to get started'}
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Sprint</th>
                  <th>Project</th>
                  <th>Goal</th>
                  <th>Dates</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displaySprints.map((s) => (
                  <tr key={s.id} className="row-clickable" onClick={() => setDetailTarget(s)}>
                    <td style={{ fontWeight: 500 }}>{s.sprint_name}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '.875rem' }}>
                      {projects.find((p) => p.id === s.project_id)?.project_name || '—'}
                    </td>
                    <td
                      style={{ color: 'var(--text-secondary)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      title={s.goal}
                    >
                      {s.goal || '—'}
                    </td>
                    <td style={{ fontSize: '.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDate(s.start_date)} → {formatDate(s.end_date)}
                    </td>
                    <td><StatusBadge status={s.sprint_status} /></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="table-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => setBurndownId(s.id)} title="Burndown chart">
                          <TrendingDown size={13} /> Chart
                        </button>
                        {canEdit && (
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(s)} title="Edit">
                            <Pencil size={14} />
                          </button>
                        )}
                        {isAdmin && (
                          <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDelTarget(s.id)} title="Delete">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!modal} title={modal === 'create' ? 'New Sprint' : 'Edit Sprint'} onClose={() => setModal(null)}>
        {modal && (
          <SprintForm
            initial={modal !== 'create' ? (modal as Sprint) : undefined}
            onSave={handleSave}
            loading={saving}
            projects={projects}
            defaultProjectId={selectedProject}
          />
        )}
      </Modal>

      <ConfirmModal
        open={!!delTarget}
        message="Delete this sprint? Tasks will remain but lose their sprint reference."
        onConfirm={handleDelete}
        onCancel={() => setDelTarget(null)}
        loading={saving}
      />

      <DetailModal
        open={!!detailTarget}
        title={detailTarget?.sprint_name || 'Sprint Detail'}
        onClose={() => setDetailTarget(null)}
        fields={detailTarget ? [
          { label: 'Sprint Name', value: detailTarget.sprint_name },
          { label: 'Project', value: projects.find((p) => p.id === detailTarget.project_id)?.project_name || '—' },
          { label: 'Goal', value: detailTarget.goal || '—', fullWidth: true },
          { label: 'Status', value: <StatusBadge status={detailTarget.sprint_status} /> },
          { label: 'Start Date', value: formatDate(detailTarget.start_date) },
          { label: 'End Date', value: formatDate(detailTarget.end_date) },
        ] : undefined}
      />

      {burndownId && <BurndownModal sprintId={burndownId} onClose={() => setBurndownId(null)} />}
    </div>
  );
};

export default SprintsPage;
