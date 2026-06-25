
import React, { useState } from 'react';
import { usersApi } from '../api';
import { useApi } from '../hooks/useApi';
import { LoadingCenter, Alert, StatusBadge, Pagination, Badge, ConfirmModal, DetailModal } from '../components/common';
// import type { DetailField } from '../components/common';
import type { User } from '../types';
import toast from 'react-hot-toast';

const UsersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [confirm, setConfirm] = useState<{ id: string; active: boolean } | null>(null);
  const [detailTarget, setDetailTarget] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { data, pagination, loading, error, refetch } = useApi(
    () => usersApi.list({ page, limit: 20, role: roleFilter || undefined }),
    [page, roleFilter]
  );

  const handleToggle = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      if (confirm.active) await usersApi.deactivate(confirm.id);
      else await usersApi.activate(confirm.id);
      toast.success(`User ${confirm.active ? 'deactivated' : 'activated'}`);
      setConfirm(null);
      refetch();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setActionLoading(false); }
  };

  const roleLabel: Record<string, string> = { admin: 'Admin', scrum_master: 'SM', employee: 'Employee' };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Users</div>
          <div className="page-subtitle">Manage all user accounts</div>
        </div>
        <select className="form-control" style={{ width: 160 }} value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="scrum_master">Scrum Master</option>
          <option value="employee">Employee</option>
        </select>
      </div>

      {loading && <LoadingCenter />}
      {error && <Alert message={error} />}

      {data && (
        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data as User[]).map((u) => (
                  <tr key={u.id} className="row-clickable" onClick={() => setDetailTarget(u)}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{u.first_name}</div>
                      {u.employee_id && <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{u.employee_id}</div>}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td><Badge color={u.role === 'admin' ? 'red' : u.role === 'scrum_master' ? 'purple' : 'blue'}>{roleLabel[u.role]}</Badge></td>
                    <td><StatusBadge status={u.is_active ? 'active' : 'cancelled'} /></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="table-actions">
                        <button className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-secondary'}`}
                          onClick={() => setConfirm({ id: u.id, active: u.is_active })}>
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={pagination?.page ?? 1} totalPages={pagination?.totalPages ?? 1}
            total={pagination?.total ?? (data as User[]).length} limit={pagination?.limit ?? 20} onPage={setPage} />
        </div>
      )}

      <ConfirmModal
        open={!!confirm}
        message={`Are you sure you want to ${confirm?.active ? 'deactivate' : 'activate'} this user?`}
        onConfirm={handleToggle}
        onCancel={() => setConfirm(null)}
        loading={actionLoading}
      />

      <DetailModal open={!!detailTarget} title={detailTarget ? detailTarget.first_name : 'User Detail'}
        onClose={() => setDetailTarget(null)}
        fields={detailTarget ? [
          { label: 'Name', value: detailTarget.first_name, fullWidth: true },
          { label: 'Employee ID', value: detailTarget.employee_id || '—' },
          { label: 'Email', value: detailTarget.email },
          { label: 'Role', value: <Badge color={detailTarget.role === 'admin' ? 'red' : detailTarget.role === 'scrum_master' ? 'purple' : 'blue'}>{roleLabel[detailTarget.role]}</Badge> },
          { label: 'Status', value: <StatusBadge status={detailTarget.is_active ? 'active' : 'cancelled'} /> },
          { label: 'Created', value: detailTarget.created_at ? new Date(detailTarget.created_at).toLocaleDateString() : '—' },
        ] : undefined}
      />
    </div>
  );
};

export default UsersPage;