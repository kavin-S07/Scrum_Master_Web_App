import React, { useState, useCallback } from 'react';
import { Plus, History, ArrowRight } from 'lucide-react';
import { reassignmentsApi, tasksApi, usersApi } from '../api';
import { useApi } from '../hooks/useApi';
import {
  LoadingCenter,
  Alert,
  Modal,
  EmptyState,
  DetailModal,
} from '../components/common';
// import type { DetailField } from '../components/common';
import type { Reassignment, ReassignmentRequest, Task, User } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ReassignForm: React.FC<{
  onSave: (d: ReassignmentRequest) => void;
  loading: boolean;
  tasks: Task[];
  users: User[];
}> = ({ onSave, loading, tasks, users }) => {
  const [form, setForm] = useState<ReassignmentRequest>({
    task_id: '',
    new_employee_id: '',
    reason: '',
  });
  const set = (k: keyof ReassignmentRequest, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
      <div className="form-group">
        <label className="form-label">Task *</label>
        <select className="form-control" value={form.task_id}
          onChange={(e) => set('task_id', e.target.value)} required>
          <option value="">Select task</option>
          {tasks.filter((t) => t.status !== 'completed').map((t) => (
            <option key={t.id} value={t.id}>{t.title} ({t.project_name})</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">New Assignee *</label>
        <select className="form-control" value={form.new_employee_id}
          onChange={(e) => set('new_employee_id', e.target.value)} required>
          <option value="">Select employee</option>
          {users.filter((u) => u.role === 'employee' && u.is_active).map((u) => (
            <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.email})</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Reason *</label>
        <textarea className="form-control" value={form.reason}
          onChange={(e) => set('reason', e.target.value)} required minLength={3} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Reassigning…' : 'Reassign Task'}
        </button>
      </div>
    </form>
  );
};

const ReassignmentsPage: React.FC = () => {
  const { user } = useAuth();
  const canReassign = user?.role === 'admin' || user?.role === 'scrum_master';

  const [showCreate, setShowCreate] = useState(false);
  const [detailTarget, setDetailTarget] = useState<Reassignment | null>(null);
  const [saving, setSaving] = useState(false);

  // History
  const [taskFilter, setTaskFilter] = useState('');
  const { data: history, loading, error, refetch } = useApi<Reassignment[]>(
    useCallback(
      () =>
        reassignmentsApi
          .list({ task_id: taskFilter || undefined })
          .then((r) => ({ data: { data: r.data.data } })),
      [taskFilter]
    )
  );

  // Form data
  const { data: tasksData } = useApi<Task[]>(
    useCallback(
      () => tasksApi.list({ limit: 200 }).then((r) => ({
        data: { data: r.data.data, pagination: r.data.pagination },
      })),
      []
    )
  );
  const tasks = tasksData || [];

  const { data: usersData } = useApi<User[]>(
    useCallback(
      () => usersApi.list({ limit: 200 }).then((r) => ({
        data: { data: r.data.data, pagination: r.data.pagination },
      })),
      []
    )
  );
  const users = usersData || [];

  const handleReassign = async (form: ReassignmentRequest) => {
    setSaving(true);
    try {
      await reassignmentsApi.create(form);
      toast.success('Task reassigned successfully');
      setShowCreate(false);
      refetch();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to reassign task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Task Reassignments</div>
          <div className="page-subtitle">View reassignment history and manage task transfers</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {canReassign && (
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              <Plus size={15} /> Manual Reassign
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title"><History size={16} /> Reassignment History</h3>
          <div>
            <input className="form-control" style={{ width: 200 }} placeholder="Filter by task ID…"
              value={taskFilter} onChange={(e) => setTaskFilter(e.target.value)} />
          </div>
        </div>

        {loading && <LoadingCenter />}
        {error && <Alert message={error} />}

        {history && (history as Reassignment[]).length === 0 ? (
          <EmptyState icon={<ArrowRight size={36} />} message="No reassignments recorded yet" />
        ) : (
          history && (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Reason</th>
                    <th>Reassigned By</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(history as Reassignment[]).map((r) => (
                    <tr key={r.id} className="row-clickable" onClick={() => setDetailTarget(r)}>
                      <td style={{ fontWeight: 500, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.task_title || r.task_id.slice(0, 8)}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{r.old_employee_name || 'Unassigned'}</td>
                      <td style={{ fontWeight: 500 }}>{r.new_employee_name || '—'}</td>
                      <td style={{ color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.reason}
                      </td>
                      <td style={{ fontSize: '.8125rem' }}>{r.reassigned_by_name || '—'}</td>
                      <td style={{ fontSize: '.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(r.reassigned_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      <Modal open={showCreate} title="Manual Task Reassignment" onClose={() => setShowCreate(false)}>
        <ReassignForm onSave={handleReassign} loading={saving} tasks={tasks} users={users} />
      </Modal>

      <DetailModal open={!!detailTarget} title="Reassignment Detail"
        onClose={() => setDetailTarget(null)}
        fields={detailTarget ? [
          { label: 'Task', value: detailTarget.task_title || detailTarget.task_id.slice(0, 8), fullWidth: true },
          { label: 'From', value: detailTarget.old_employee_name || 'Unassigned' },
          { label: 'To', value: detailTarget.new_employee_name || '—' },
          { label: 'Reassigned By', value: detailTarget.reassigned_by_name || '—' },
          { label: 'Reason', value: detailTarget.reason, fullWidth: true },
          { label: 'Date', value: new Date(detailTarget.reassigned_at).toLocaleString() },
        ] : undefined}
      />
    </div>
  );
};

export default ReassignmentsPage;
