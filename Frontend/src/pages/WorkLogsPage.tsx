import React, { useState } from 'react';
import { Clock, Plus } from 'lucide-react';
import { workLogsApi, tasksApi } from '../api';
import { useApi } from '../hooks/useApi';
import {
  LoadingCenter,
  Alert,
  Modal,
  EmptyState,
} from '../components/common';
import type { WorkLog, WorkLogRequest, Task } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const WorkLogForm: React.FC<{
  onSave: (d: WorkLogRequest) => void;
  loading: boolean;
  tasks: Task[];
}> = ({ onSave, loading, tasks }) => {
  const [form, setForm] = useState<WorkLogRequest>({
    task_id: '',
    worked_hours: 1,
    description: '',
    log_date: new Date().toISOString().slice(0, 10),
  });
  const set = (k: keyof WorkLogRequest, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
      <div className="form-group">
        <label className="form-label">Task *</label>
        <select className="form-control" value={form.task_id}
          onChange={(e) => set('task_id', e.target.value)} required>
          <option value="">Select task</option>
          {tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Hours *</label>
          <input className="form-control" type="number" min={0.5} max={24} step={0.5}
            value={form.worked_hours}
            onChange={(e) => set('worked_hours', parseFloat(e.target.value) || 0)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Date *</label>
          <input className="form-control" type="date" value={form.log_date}
            onChange={(e) => set('log_date', e.target.value)} required max={new Date().toISOString().slice(0, 10)} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Description *</label>
        <textarea className="form-control" value={form.description}
          onChange={(e) => set('description', e.target.value)} required minLength={1} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Log Hours'}
        </button>
      </div>
    </form>
  );
};

const WorkLogsPage: React.FC = () => {
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: logs, loading, error, refetch } = useApi<WorkLog[]>(
    () => workLogsApi.my().then((r) => ({ data: { data: r.data.data } }))
  );

  const { data: tasksData } = useApi<Task[]>(
    () => tasksApi.list({ limit: 100 }).then((r) => ({
      data: { data: r.data.data, pagination: r.data.pagination },
    }))
  );

  const handleCreate = async (form: WorkLogRequest) => {
    setSaving(true);
    try {
      await workLogsApi.create(form);
      toast.success('Work log created');
      setShowCreate(false);
      refetch();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to log hours');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Work Logs</div>
          <div className="page-subtitle">Track your logged hours</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={15} /> Log Hours
        </button>
      </div>

      {loading && <LoadingCenter />}
      {error && <Alert message={error} />}

      <div className="card">
        {!logs || (logs as WorkLog[]).length === 0 ? (
          <EmptyState icon={<Clock size={40} />} message="No work logs yet" />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Hours</th>
                  <th>Date</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {(logs as WorkLog[]).map((w) => (
                  <tr key={w.id}>
                    <td style={{ fontWeight: 500 }}>{w.task_title || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '.8125rem' }}>{w.project_name || '—'}</td>
                    <td style={{ fontWeight: 600 }}>{w.worked_hours}h</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '.8125rem' }}>{new Date(w.log_date).toLocaleDateString()}</td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showCreate} title="Log Work Hours" onClose={() => setShowCreate(false)}>
        <WorkLogForm onSave={handleCreate} loading={saving} tasks={tasksData || []} />
      </Modal>
    </div>
  );
};

export default WorkLogsPage;
