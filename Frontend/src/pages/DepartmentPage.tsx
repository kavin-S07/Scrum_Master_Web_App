
import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { departmentsApi } from '../api';
import { useApi } from '../hooks/useApi';
import { LoadingCenter, Alert, Modal, EmptyState, ConfirmModal, DetailModal } from '../components/common';
// import type { DetailField } from '../components/common';
import type { Department } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext'; 

const DeptForm: React.FC<{
  initial?: Department; onSave: (d: { name: string; description: string }) => void; loading: boolean;
}> = ({ initial, onSave, loading }) => {
  const [form, setForm] = useState({ name: initial?.name || '', description: initial?.description || '' });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
      <div className="form-group">
        <label className="form-label">Name *</label>
        <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Saving…' : initial ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

const DepartmentsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { data, loading, error, refetch } = useApi<Department[]>(() => departmentsApi.list());
  const [modal, setModal] = useState<'create' | Department | null>(null);
  const [delTarget, setDelTarget] = useState<string | null>(null);
  const [detailTarget, setDetailTarget] = useState<Department | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (form: { name: string; description: string }) => {
    setSaving(true);
    try {
      if (modal === 'create') await departmentsApi.create(form);
      else if (modal) await departmentsApi.update((modal as Department).id, form);
      toast.success(modal === 'create' ? 'Department created' : 'Department updated');
      setModal(null); refetch();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!delTarget) return;
    setSaving(true);
    try {
      await departmentsApi.delete(delTarget);
      toast.success('Department deleted');
      setDelTarget(null); refetch();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingCenter />;
  if (error) return <Alert message={error} />;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Departments</div>
          <div className="page-subtitle">{data?.length || 0} departments</div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setModal('create')}>
            <Plus size={15} /> New Department
          </button>
        )}
      </div>

      <div className="card">
        {!data || data.length === 0
          ? <EmptyState icon={<Building2 size={40} />} message="No departments yet" />
          : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Name</th><th>Description</th><th>Created</th>{isAdmin && <th>Actions</th>}</tr></thead>
                <tbody>
                  {data.map((d) => (
                    <tr key={d.id} className="row-clickable" onClick={() => setDetailTarget(d)}>
                      <td style={{ fontWeight: 500 }}>{d.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{d.description || '—'}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{new Date(d.created_at).toLocaleDateString()}</td>
                      {isAdmin && (
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="table-actions">
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(d)}><Pencil size={14} /></button>
                            <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDelTarget(d.id)}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      <Modal open={!!modal} title={modal === 'create' ? 'New Department' : 'Edit Department'} onClose={() => setModal(null)}>
        {modal && <DeptForm initial={modal !== 'create' ? modal as Department : undefined} onSave={handleSave} loading={saving} />}
      </Modal>

      <ConfirmModal open={!!delTarget} message="Delete this department? Teams will lose their department reference."
        onConfirm={handleDelete} onCancel={() => setDelTarget(null)} loading={saving} />

      <DetailModal open={!!detailTarget} title={detailTarget?.name || 'Department Detail'}
        onClose={() => setDetailTarget(null)}
        fields={detailTarget ? [
          { label: 'Name', value: detailTarget.name },
          { label: 'Description', value: detailTarget.description || '—', fullWidth: true },
          { label: 'Created', value: new Date(detailTarget.created_at).toLocaleDateString() },
        ] : undefined}
      />
    </div>
  );
};

export default DepartmentsPage;