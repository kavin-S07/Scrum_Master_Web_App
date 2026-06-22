import React, { useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Briefcase } from 'lucide-react';
import { projectsApi } from '../api';
import { useApi } from '../hooks/useApi';
import {
  LoadingCenter,
  Alert,
  Modal,
  EmptyState,
  StatusBadge,
  ConfirmModal,
  Pagination,
  DetailModal,
} from '../components/common';
import type { DetailField } from '../components/common';
import type { Project, ProjectRequest, ProjectStatus } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const STATUSES: ProjectStatus[] = ['planning', 'active', 'on_hold', 'completed', 'cancelled'];

const fmt = (d: string) =>
  d
    ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

const ProjectForm: React.FC<{
  initial?: Project;
  onSave: (d: ProjectRequest) => void;
  loading: boolean;
}> = ({ initial, onSave, loading }) => {
  const [form, setForm] = useState<ProjectRequest>({
    project_name: initial?.project_name || '',
    project_code: initial?.project_code || '',
    description: initial?.description || '',
    start_date: initial?.start_date?.slice(0, 10) || '',
    end_date: initial?.end_date?.slice(0, 10) || '',
    status: initial?.status || 'planning',
  });
  const set = (k: keyof ProjectRequest, v: string) => setForm((f) => ({ ...f, [k]: v }));

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
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Project Name *</label>
          <input
            className="form-control"
            value={form.project_name}
            onChange={(e) => set('project_name', e.target.value)}
            required
            minLength={2}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Project Code *</label>
          <input
            className="form-control"
            value={form.project_code}
            onChange={(e) => set('project_code', e.target.value.toUpperCase())}
            required
            disabled={!!initial}
            placeholder="e.g. PROJ01"
          />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          className="form-control"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
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
          value={form.status}
          onChange={(e) => set('status', e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
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

const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');

  const { data, pagination, loading, error, refetch } = useApi<Project[]>(
    useCallback(
      () =>
        projectsApi
          .list({ page, limit: 20, status: statusFilter || undefined })
          .then((r) => ({ data: { data: r.data.data, pagination: r.data.pagination } })),
      [page, statusFilter]
    )
  );

  const [modal, setModal] = useState<'create' | Project | null>(null);
  const [delTarget, setDelTarget] = useState<string | null>(null);
  const [detailTarget, setDetailTarget] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (form: ProjectRequest) => {
    setSaving(true);
    try {
      if (modal === 'create') {
        await projectsApi.create(form);
      } else if (modal) {
        await projectsApi.update((modal as Project).id, form);
      }
      toast.success(modal === 'create' ? 'Project created' : 'Project updated');
      setModal(null);
      refetch();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!delTarget) return;
    setSaving(true);
    try {
      await projectsApi.delete(delTarget);
      toast.success('Project deleted');
      setDelTarget(null);
      refetch();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to delete project');
    } finally {
      setSaving(false);
    }
  };

  const projects = data || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Projects</div>
          <div className="page-subtitle">All projects in your organization</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select
            className="form-control"
            style={{ width: 150 }}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ProjectStatus | '');
              setPage(1);
            }}
          >
            <option value="">All Status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setModal('create')}>
              <Plus size={15} /> New Project
            </button>
          )}
        </div>
      </div>

      {loading && <LoadingCenter />}
      {error && <Alert message={error} />}

      {data && (
        <div className="card">
          {projects.length === 0 ? (
            <EmptyState icon={<Briefcase size={40} />} message="No projects found" />
          ) : (
            <>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Code</th>
                      <th>Dates</th>
                      <th>Status</th>
                      {isAdmin && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p) => (
                      <tr
                        key={p.id}
                        className="row-clickable"
                        onClick={() => setDetailTarget(p)}
                      >
                        <td>
                          <div style={{ fontWeight: 500 }}>{p.project_name}</div>
                          {p.description && (
                            <div
                              style={{
                                fontSize: '.75rem',
                                color: 'var(--text-muted)',
                                maxWidth: 220,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={p.description}
                            >
                              {p.description}
                            </div>
                          )}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '.8125rem', color: 'var(--primary)' }}>
                          {p.project_code}
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '.8125rem', whiteSpace: 'nowrap' }}>
                          {fmt(p.start_date)} → {fmt(p.end_date)}
                        </td>
                        <td>
                          <StatusBadge status={p.status} />
                        </td>
                        {isAdmin && (
                          <td>
                            <div className="table-actions">
                              <button
                                className="btn btn-ghost btn-icon btn-sm"
                                onClick={(e) => { e.stopPropagation(); setModal(p); }}
                                title="Edit project"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                className="btn btn-danger btn-icon btn-sm"
                                onClick={(e) => { e.stopPropagation(); setDelTarget(p.id); }}
                                title="Delete project"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pagination && (
                <Pagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  total={pagination.total}
                  limit={pagination.limit}
                  onPage={setPage}
                />
              )}
            </>
          )}
        </div>
      )}

      <Modal
        open={!!modal}
        title={modal === 'create' ? 'New Project' : 'Edit Project'}
        onClose={() => setModal(null)}
      >
        {modal && (
          <ProjectForm
            initial={modal !== 'create' ? (modal as Project) : undefined}
            onSave={handleSave}
            loading={saving}
          />
        )}
      </Modal>

      <ConfirmModal
        open={!!delTarget}
        message="Delete this project? All sprints and tasks will be removed."
        onConfirm={handleDelete}
        onCancel={() => setDelTarget(null)}
        loading={saving}
      />

      <DetailModal open={!!detailTarget} title={detailTarget?.project_name || 'Project Detail'}
        onClose={() => setDetailTarget(null)}
        fields={(() => {
          if (!detailTarget) return undefined;
          const f: DetailField[] = [
            { label: 'Project Name', value: detailTarget.project_name, fullWidth: true },
            { label: 'Project Code', value: detailTarget.project_code },
            { label: 'Status', value: <StatusBadge status={detailTarget.status} /> },
            { label: 'Start Date', value: fmt(detailTarget.start_date) },
            { label: 'End Date', value: fmt(detailTarget.end_date) },
          ];
          if (detailTarget.description) f.push({ label: 'Description', value: detailTarget.description, fullWidth: true });
          return f;
        })()}
      >
        {detailTarget && (
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <button className="btn btn-primary btn-sm" onClick={() => { setDetailTarget(null); navigate(`/projects/${detailTarget.id}`); }}>
              View Full Project →
            </button>
          </div>
        )}
      </DetailModal>
    </div>
  );
};

export default ProjectsPage;