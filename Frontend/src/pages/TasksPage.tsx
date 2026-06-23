import React, { useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, CheckSquare, UserPlus, ChevronDown } from 'lucide-react';
import { tasksApi, projectsApi, sprintsApi, usersApi } from '../api';
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
import type { Task, TaskRequest, TaskStatus, TaskPriority, Project, Sprint, User } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'testing', 'completed', 'blocked'];
const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'critical'];

const STATUS_STYLES: Record<TaskStatus, { bg: string; fg: string; border: string }> = {
  todo:        { bg: 'var(--bg-elevated)',  fg: 'var(--text-secondary)', border: 'var(--border)' },
  in_progress: { bg: 'var(--primary-subtle)',  fg: 'var(--primary-hover)', border: 'rgba(37,99,235,.18)' },
  testing:     { bg: 'var(--purple-subtle)',   fg: 'var(--purple-text)',   border: 'rgba(139,92,246,.18)' },
  completed:   { bg: 'var(--success-subtle)',  fg: 'var(--success-text)',  border: 'rgba(16,185,129,.18)' },
  blocked:     { bg: 'var(--danger-subtle)',   fg: 'var(--danger-text)',   border: 'rgba(239,68,68,.18)' },
};

const TaskForm: React.FC<{
  initial?: Task;
  onSave: (d: TaskRequest) => void;
  loading: boolean;
  projects: Project[];
  sprints: Sprint[];
}> = ({ initial, onSave, loading, projects, sprints }) => {
  const [form, setForm] = useState<TaskRequest>({
    project_id: initial?.project_id || '',
    sprint_id: initial?.sprint_id || '',
    title: initial?.title || '',
    description: initial?.description || '',
    priority: initial?.priority || 'medium',
    status: initial?.status || 'todo',
    story_points: initial?.story_points || undefined,
    due_date: initial?.due_date?.slice(0, 10) || '',
  });
  const set = (k: keyof TaskRequest, v: string | number | undefined) =>
    setForm((f) => ({ ...f, [k]: v }));

  const clean = (f: TaskRequest): TaskRequest => ({
    ...f,
    sprint_id: f.sprint_id || undefined,
    due_date: f.due_date || undefined,
    story_points: f.story_points || undefined,
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(clean(form)); }}>
      <div className="form-group">
        <label className="form-label">Project *</label>
        <select className="form-control" value={form.project_id}
          onChange={(e) => set('project_id', e.target.value)} required>
          <option value="">Select project</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.project_name}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Sprint</label>
        <select className="form-control" value={form.sprint_id || ''}
          onChange={(e) => set('sprint_id', e.target.value)}>
          <option value="">No sprint</option>
          {sprints.map((s) => <option key={s.id} value={s.id}>{s.sprint_name}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Title *</label>
        <input className="form-control" value={form.title}
          onChange={(e) => set('title', e.target.value)} required minLength={2} />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-control" value={form.description || ''}
          onChange={(e) => set('description', e.target.value)} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select className="form-control" value={form.priority}
            onChange={(e) => set('priority', e.target.value)}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-control" value={form.status}
            onChange={(e) => set('status', e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Story Points</label>
          <input className="form-control" type="number" min={1} max={100}
            value={form.story_points || ''}
            onChange={(e) => set('story_points', e.target.value ? parseInt(e.target.value, 10) : undefined)} />
        </div>
        <div className="form-group">
          <label className="form-label">Due Date</label>
          <input className="form-control" type="date"
            value={form.due_date || ''}
            onChange={(e) => set('due_date', e.target.value)} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Saving…' : initial ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

const AssignForm: React.FC<{
  taskId: string;
  currentAssignee?: string;
  onAssign: (taskId: string, employeeId: string) => void;
  loading: boolean;
  users: User[];
}> = ({ taskId, onAssign, loading, users }) => {
  const [employeeId, setEmployeeId] = useState('');
  return (
    <form onSubmit={(e) => { e.preventDefault(); onAssign(taskId, employeeId); }}>
      <div className="form-group">
        <label className="form-label">Select Employee *</label>
        <select className="form-control" value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)} required>
          <option value="">Choose employee…</option>
          {users.filter((u) => u.role === 'employee' && u.is_active).map((u) => (
            <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.email})</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" type="submit" disabled={loading || !employeeId}>
          {loading ? 'Assigning…' : 'Assign'}
        </button>
      </div>
    </form>
  );
};

const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isSM = user?.role === 'scrum_master';
  const canEdit = isAdmin || isSM;
  const isEmployee = user?.role === 'employee';

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');

  const { data, pagination, loading, error, refetch } = useApi<Task[]>(
    useCallback(
      () =>
        tasksApi.list({ page, limit: 20, status: statusFilter || undefined, priority: priorityFilter || undefined })
          .then((r) => ({ data: { data: r.data.data, pagination: r.data.pagination } })),
      [page, statusFilter, priorityFilter]
    )
  );

  const { data: projectsData } = useApi<Project[]>(
    useCallback(() => projectsApi.list({ limit: 100 }).then((r) => ({
      data: { data: r.data.data, pagination: r.data.pagination },
    })), [])
  );
  const projects = projectsData || [];

  const firstProjectId = projects.length > 0 ? projects[0]?.id : null;
  // AFTER
const { data: sprintsData } = useApi<Sprint[]>(
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useCallback(() =>
    firstProjectId
      ? sprintsApi.listByProject(firstProjectId).then((r) => ({
          data: { data: r.data.data },
        }))
      : Promise.resolve({ data: { data: [] as Sprint[] } }),
    [firstProjectId]
  )
);
  const sprints = sprintsData || [];

  const { data: usersData } = useApi<User[]>(
    useCallback(() => usersApi.list({ limit: 200 }).then((r) => ({
      data: { data: r.data.data, pagination: r.data.pagination },
    })), [])
  );
  const users = usersData || [];
  // const employees = users.filter((u) => u.role === 'employee' && u.is_active);

  const [modal, setModal] = useState<'create' | Task | null>(null);
  const [delTarget, setDelTarget] = useState<string | null>(null);
  const [assignTarget, setAssignTarget] = useState<string | null>(null);
  const [detailTarget, setDetailTarget] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);
  const [changingId, setChangingId] = useState<string | null>(null);

  const handleSave = async (form: TaskRequest) => {
    setSaving(true);
    try {
      if (modal === 'create') {
        await tasksApi.create(form);
      } else if (modal) {
        await tasksApi.update((modal as Task).id, form);
      }
      toast.success(modal === 'create' ? 'Task created' : 'Task updated');
      setModal(null);
      refetch();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string; errors?: unknown } } };
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async (taskId: string, employeeId: string) => {
    setSaving(true);
    try {
      await tasksApi.assign(taskId, employeeId);
      toast.success('Task assigned');
      setAssignTarget(null);
      refetch();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to assign task');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    setChangingId(taskId);
    try {
      await tasksApi.updateStatus(taskId, status);
      toast.success(`Status: ${status.replace(/_/g, ' ')}`);
      refetch();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setChangingId(null);
    }
  };

  const handleDelete = async () => {
    if (!delTarget) return;
    setSaving(true);
    try {
      await tasksApi.delete(delTarget);
      toast.success('Task deleted');
      setDelTarget(null);
      refetch();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Tasks</div>
          <div className="page-subtitle">{isEmployee ? 'My tasks' : 'All tasks'} </div>
        </div>
        <div className="page-header-actions">
          <select className="form-control filter-select" value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as TaskStatus | ''); setPage(1); }}>
            <option value="">All Status</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <select className="form-control filter-select" value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value as TaskPriority | ''); setPage(1); }}>
            <option value="">All Priority</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          {canEdit && (
            <button className="btn btn-primary" onClick={() => setModal('create')}>
              <Plus size={15} /> New Task
            </button>
          )}
        </div>
      </div>

      {loading && <LoadingCenter />}
      {error && <Alert message={error} />}

      {data && (
        <div className="card">
          {(data as Task[]).length === 0 ? (
            <EmptyState icon={<CheckSquare size={40} />} message="No tasks found" />
          ) : (
            <>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Project</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Assigned To</th>
                      <th>Due</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data as Task[]).map((t) => (
                      <tr key={t.id} className="row-clickable" onClick={() => setDetailTarget(t)}>
                        <td className="cell-title">{t.title}</td>
                        <td className="cell-muted">{t.project_name || '—'}</td>
                        <td><StatusBadge status={t.priority} /></td>
                        <td>
                          {(canEdit || (isEmployee && t.assigned_to_id === user?.id)) ? (
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                              <select
                                value={t.status}
                                onChange={(e) => { e.stopPropagation(); handleStatusChange(t.id, e.target.value as TaskStatus); }}
                                disabled={changingId === t.id}
                                className="status-select"
                                style={{
                                  background: STATUS_STYLES[t.status].bg,
                                  color: STATUS_STYLES[t.status].fg,
                                  borderColor: STATUS_STYLES[t.status].border,
                                  opacity: changingId === t.id ? .6 : 1,
                                }}
                              >
                                {STATUSES.map((s) => (
                                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                ))}
                              </select>
                              <ChevronDown size={12} style={{
                                position: 'absolute', right: 6, top: '50%',
                                transform: 'translateY(-50%)',
                                color: STATUS_STYLES[t.status].fg,
                                pointerEvents: 'none',
                                opacity: .7,
                              }} />
                            </div>
                          ) : (
                            <StatusBadge status={t.status} />
                          )}
                        </td>
                        <td className="cell-muted">{t.assigned_to_name || '—'}</td>
                        <td className="cell-muted cell-date">{t.due_date ? new Date(t.due_date).toLocaleDateString() : '—'}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="table-actions">
                            {canEdit && !t.assigned_to_id && (
                              <button className="btn btn-ghost btn-sm"
                                onClick={() => setAssignTarget(t.id)} title="Assign employee">
                                <UserPlus size={13} /> Assign
                              </button>
                            )}
                            {(canEdit || (isEmployee && t.assigned_to_id === user?.id)) && (
                              <button className="btn btn-ghost btn-icon btn-sm"
                                onClick={() => setModal(t)} title="Edit task">
                                <Pencil size={14} />
                              </button>
                            )}
                            {isAdmin && (
                              <button className="btn btn-danger btn-icon btn-sm"
                                onClick={() => setDelTarget(t.id)} title="Delete task">
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
              {pagination && (
                <Pagination page={pagination.page} totalPages={pagination.totalPages}
                  total={pagination.total} limit={pagination.limit} onPage={setPage} />
              )}
            </>
          )}
        </div>
      )}

      <Modal open={!!modal} title={modal === 'create' ? 'New Task' : 'Edit Task'}
        onClose={() => setModal(null)}>
        {modal && (
          <TaskForm initial={modal !== 'create' ? (modal as Task) : undefined}
            onSave={handleSave} loading={saving} projects={projects} sprints={sprints} />
        )}
      </Modal>

      <Modal open={!!assignTarget} title="Assign Task" onClose={() => setAssignTarget(null)}>
        {assignTarget && (
          <AssignForm taskId={assignTarget} onAssign={handleAssign}
            loading={saving} users={users} />
        )}
      </Modal>

      <ConfirmModal open={!!delTarget} message="Delete this task? This action cannot be undone."
        onConfirm={handleDelete} onCancel={() => setDelTarget(null)} loading={saving} />

      <DetailModal open={!!detailTarget} title={detailTarget?.title || 'Task Detail'}
        onClose={() => setDetailTarget(null)}
        fields={(() => {
          if (!detailTarget) return undefined;
          const f: DetailField[] = [
            { label: 'Title', value: detailTarget.title, fullWidth: true },
            { label: 'Project', value: detailTarget.project_name || '—' },
            { label: 'Sprint', value: detailTarget.sprint_name || '—' },
            { label: 'Priority', value: <StatusBadge status={detailTarget.priority} /> },
            { label: 'Status', value: <StatusBadge status={detailTarget.status} /> },
            { label: 'Assigned To', value: detailTarget.assigned_to_name || 'Unassigned' },
            { label: 'Story Points', value: detailTarget.story_points ?? '—' },
            { label: 'Due Date', value: detailTarget.due_date ? new Date(detailTarget.due_date).toLocaleDateString() : '—' },
            { label: 'Created', value: new Date(detailTarget.created_at).toLocaleDateString() },
          ];
          if (detailTarget.description) f.push({ label: 'Description', value: detailTarget.description, fullWidth: true });
          return f;
        })()}
      />
    </div>
  );
};

export default TasksPage;
