import React, { useState, useCallback } from 'react';
import { Plus, CalendarDays } from 'lucide-react';
import { leavesApi } from '../api';
import { useApi } from '../hooks/useApi';
import {
  LoadingCenter,
  Alert,
  Modal,
  EmptyState,
  StatusBadge,
  Pagination,
  DetailModal,
} from '../components/common';
import type { DetailField } from '../components/common';
import type { LeaveRequest, LeaveRequestBody, LeaveType, LeaveStatus } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const LEAVE_TYPES: LeaveType[] = ['medical', 'casual', 'annual', 'emergency', 'unpaid'];

const LeaveForm: React.FC<{
  onSave: (d: LeaveRequestBody) => void;
  loading: boolean;
}> = ({ onSave, loading }) => {
  const [form, setForm] = useState<LeaveRequestBody>({
    leave_type: 'casual',
    start_date: '',
    end_date: '',
    reason: '',
  });
  const set = (k: keyof LeaveRequestBody, v: string) => setForm((f) => ({ ...f, [k]: v }));

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
        <label className="form-label">Leave Type *</label>
        <select className="form-control" value={form.leave_type}
          onChange={(e) => set('leave_type', e.target.value)} required>
          {LEAVE_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Start Date *</label>
          <input className="form-control" type="date" value={form.start_date}
            onChange={(e) => set('start_date', e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">End Date *</label>
          <input className="form-control" type="date" value={form.end_date}
            min={form.start_date} onChange={(e) => set('end_date', e.target.value)} required />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Reason *</label>
        <textarea className="form-control" value={form.reason}
          onChange={(e) => set('reason', e.target.value)} required minLength={10} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Submitting…' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
};

const LeavesPage: React.FC = () => {
  const { user } = useAuth();
  const isAdminOrSM = user?.role === 'admin' || user?.role === 'scrum_master';
  const isEmployee = user?.role === 'employee';

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | ''>('');

  const { data, pagination, loading, error, refetch } = useApi<LeaveRequest[]>(
    useCallback(
      () =>
        leavesApi.list({ page, limit: 20, status: statusFilter || undefined })
          .then((r) => ({ data: { data: r.data.data, pagination: r.data.pagination } })),
      [page, statusFilter]
    )
  );

  const [showCreate, setShowCreate] = useState(false);
  const [detailTarget, setDetailTarget] = useState<LeaveRequest | null>(null);
  const [saving, setSaving] = useState(false);

  const handleCreate = async (form: LeaveRequestBody) => {
    setSaving(true);
    try {
      await leavesApi.create(form);
      toast.success('Leave request submitted');
      setShowCreate(false);
      refetch();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to submit leave');
    } finally {
      setSaving(false);
    }
  };

  const handleDecision = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await leavesApi.decision(id, { status });
      toast.success(`Leave ${status}`);
      refetch();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await leavesApi.cancel(id);
      toast.success('Leave cancelled');
      refetch();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Leave Management</div>
          <div className="page-subtitle">{isEmployee ? 'My leave requests' : 'All leave requests'}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select className="form-control" style={{ width: 140 }} value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as LeaveStatus | ''); setPage(1); }}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> New Request
          </button>
        </div>
      </div>

      {loading && <LoadingCenter />}
      {error && <Alert message={error} />}

      {data && (
        <div className="card">
          {(data as LeaveRequest[]).length === 0 ? (
            <EmptyState icon={<CalendarDays size={40} />} message="No leave requests found" />
          ) : (
            <>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Type</th>
                      <th>Dates</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data as LeaveRequest[]).map((l) => (
                      <tr key={l.id} className="row-clickable" onClick={() => setDetailTarget(l)}>
                        <td style={{ fontWeight: 500 }}>{l.employee_name || '—'}</td>
                        <td><StatusBadge status={l.leave_type} /></td>
                        <td style={{ fontSize: '.8125rem', whiteSpace: 'nowrap' }}>
                          {new Date(l.start_date).toLocaleDateString()} → {new Date(l.end_date).toLocaleDateString()}
                        </td>
                        <td style={{ color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</td>
                        <td><StatusBadge status={l.status} /></td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="table-actions">
                            {l.status === 'pending' && isAdminOrSM && (
                              <>
                                <button className="btn btn-sm" style={{ background: 'var(--success-subtle)', color: 'var(--success)' }}
                                  onClick={() => handleDecision(l.id, 'approved')}>Approve</button>
                                <button className="btn btn-danger btn-sm"
                                  onClick={() => handleDecision(l.id, 'rejected')}>Reject</button>
                              </>
                            )}
                            {l.status === 'pending' && l.employee_id === user?.id && (
                              <button className="btn btn-secondary btn-sm"
                                onClick={() => handleCancel(l.id)}>Cancel</button>
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

      <Modal open={showCreate} title="New Leave Request" onClose={() => setShowCreate(false)}>
        <LeaveForm onSave={handleCreate} loading={saving} />
      </Modal>

      <DetailModal open={!!detailTarget} title="Leave Request Detail"
        onClose={() => setDetailTarget(null)}
        fields={detailTarget ? [
          { label: 'Employee', value: detailTarget.employee_name || '—', fullWidth: true },
          { label: 'Leave Type', value: <StatusBadge status={detailTarget.leave_type} /> },
          { label: 'Status', value: <StatusBadge status={detailTarget.status} /> },
          { label: 'Start Date', value: new Date(detailTarget.start_date).toLocaleDateString() },
          { label: 'End Date', value: new Date(detailTarget.end_date).toLocaleDateString() },
          { label: 'Reason', value: detailTarget.reason, fullWidth: true },
          { label: 'Created', value: new Date(detailTarget.created_at).toLocaleDateString() },
        ] : undefined}
      />
    </div>
  );
};

export default LeavesPage;
