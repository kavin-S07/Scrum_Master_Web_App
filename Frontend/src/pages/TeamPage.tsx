import React, { useState, useCallback } from 'react';
import { Plus, Pencil, Users } from 'lucide-react';
import { teamsApi, departmentsApi, usersApi } from '../api';
import { useApi } from '../hooks/useApi';
import { LoadingCenter, Alert, Modal, EmptyState, StatusBadge, DetailModal } from '../components/common';
import type { DetailField } from '../components/common';
import type { Team, Department, User, TeamMember } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const TeamForm: React.FC<{
  initial?: Team;
  onSave: (d: { team_name: string; department_id: string; scrum_master_id: string }) => void;
  loading: boolean;
  departments: Department[];
  scrumMasters: User[];
}> = ({ initial, onSave, loading, departments, scrumMasters }) => {
  const [form, setForm] = useState({
    team_name: initial?.team_name || '',
    department_id: initial?.department_id || '',
    scrum_master_id: initial?.scrum_master_id || '',
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
      <div className="form-group">
        <label className="form-label">Team Name *</label>
        <input
          className="form-control"
          value={form.team_name}
          onChange={(e) => set('team_name', e.target.value)}
          required
          minLength={2}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Department *</label>
        <select
          className="form-control"
          value={form.department_id}
          onChange={(e) => set('department_id', e.target.value)}
          required
        >
          <option value="">Select department</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Scrum Master *</label>
        <select
          className="form-control"
          value={form.scrum_master_id}
          onChange={(e) => set('scrum_master_id', e.target.value)}
          required
        >
          <option value="">Select scrum master</option>
          {scrumMasters.map((u) => (
            <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
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

const MembersModal: React.FC<{ team: Team; onClose: () => void; canEdit: boolean }> = ({
  team,
  onClose,
  canEdit,
}) => {
  const { data: members, loading, refetch } = useApi<TeamMember[]>(
    useCallback(() => teamsApi.members(team.id), [team.id])
  );

  // FIX: usersApi.list returns a PaginatedResponse, not ApiResponse<User[]>.
  // The useApi hook reads res.data.data which for paginated endpoints is the
  // array of items. Cast accordingly instead of forcing to User[].
  const { data: employeeList } = useApi<User[]>(
    useCallback(() =>
      usersApi.list({ limit: 100, role: 'employee' }).then((r) => ({
        data: { data: r.data.data, pagination: r.data.pagination },
      })), [])
  );

  const [addId, setAddId] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!addId) return;
    setAdding(true);
    try {
      await teamsApi.addMember(team.id, addId);
      toast.success('Member added');
      setAddId('');
      refetch();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (empId: string) => {
    try {
      await teamsApi.removeMember(team.id, empId);
      toast.success('Member removed');
      refetch();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  // Employees already on the team (by their user id, which equals employee_id in member rows)
  const memberUserIds = new Set((members || []).map((m) => m.id));
  const available = (employeeList || []).filter((u) => !memberUserIds.has(u.id));

  return (
    <Modal open title={`Members — ${team.team_name}`} onClose={onClose} maxWidth={560}>
      {canEdit && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <select
            className="form-control"
            value={addId}
            onChange={(e) => setAddId(e.target.value)}
          >
            <option value="">Add employee…</option>
            {available.map((u) => (
              <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
            ))}
          </select>
          <button
            className="btn btn-primary"
            onClick={handleAdd}
            disabled={adding || !addId}
          >
            Add
          </button>
        </div>
      )}
      {loading ? (
        <LoadingCenter />
      ) : !members || members.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', padding: '16px 0' }}>No members yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                {canEdit && <th></th>}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 500 }}>{m.first_name} {m.last_name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{m.email}</td>
                  <td><StatusBadge status={m.role} /></td>
                  {canEdit && (
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemove(m.employee_id)}
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
};

const TeamsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const canEdit = user?.role === 'admin' || user?.role === 'scrum_master';

  const { data: teams, loading, error, refetch } = useApi<Team[]>(
    useCallback(() => teamsApi.list(), [])
  );
  const { data: departments } = useApi<Department[]>(
    useCallback(() => departmentsApi.list(), [])
  );
  const { data: smList } = useApi<User[]>(
    useCallback(() =>
      usersApi.list({ limit: 100, role: 'scrum_master' }).then((r) => ({
        data: { data: r.data.data, pagination: r.data.pagination },
      })), [])
  );

  const [modal, setModal] = useState<'create' | Team | null>(null);
  const [membersTeam, setMembersTeam] = useState<Team | null>(null);
  const [detailTarget, setDetailTarget] = useState<Team | null>(null);
  const [saving, setSaving] = useState(false);

  const smUsers = smList || [];

  const handleSave = async (form: {
    team_name: string;
    department_id: string;
    scrum_master_id: string;
  }) => {
    setSaving(true);
    try {
      if (modal === 'create') {
        await teamsApi.create(form);
      } else if (modal) {
        await teamsApi.update((modal as Team).id, form);
      }
      toast.success(modal === 'create' ? 'Team created' : 'Team updated');
      setModal(null);
      refetch();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to save team');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingCenter />;
  if (error) return <Alert message={error} />;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Teams</div>
          <div className="page-subtitle">{teams?.length || 0} teams</div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setModal('create')}>
            <Plus size={15} /> New Team
          </button>
        )}
      </div>

      <div className="card">
        {!teams || teams.length === 0 ? (
          <EmptyState icon={<Users size={40} />} message="No teams yet" />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Team Name</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t) => (
                  <tr key={t.id} className="row-clickable" onClick={() => setDetailTarget(t)}>
                    <td style={{ fontWeight: 500 }}>{t.team_name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {departments?.find((d) => d.id === t.department_id)?.name || '—'}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="table-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => { setDetailTarget(null); setMembersTeam(t); }}
                        >
                          <Users size={13} /> Members
                        </button>
                        {isAdmin && (
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => setModal(t)}
                            title="Edit team"
                          >
                            <Pencil size={14} />
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

      <Modal
        open={!!modal}
        title={modal === 'create' ? 'New Team' : 'Edit Team'}
        onClose={() => setModal(null)}
      >
        {modal && departments && (
          <TeamForm
            initial={modal !== 'create' ? (modal as Team) : undefined}
            onSave={handleSave}
            loading={saving}
            departments={departments}
            scrumMasters={smUsers}
          />
        )}
      </Modal>

      <DetailModal open={!!detailTarget} title={detailTarget?.team_name || 'Team Detail'}
        onClose={() => setDetailTarget(null)}
        fields={(() => {
          if (!detailTarget) return undefined;
          const sm = smUsers.find((u) => u.id === detailTarget.scrum_master_id);
          const f: DetailField[] = [
            { label: 'Team Name', value: detailTarget.team_name },
            { label: 'Department', value: departments?.find((d) => d.id === detailTarget.department_id)?.name || '—' },
            { label: 'Scrum Master', value: sm ? `${sm.first_name} ${sm.last_name}` : '—' },
            { label: 'Created', value: detailTarget.created_at ? new Date(detailTarget.created_at).toLocaleDateString() : '—' },
          ];
          return f;
        })()}
      >
        {detailTarget && (
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => { setDetailTarget(null); setMembersTeam(detailTarget); }}>
              <Users size={13} /> View Members
            </button>
          </div>
        )}
      </DetailModal>

      {membersTeam && (
        <MembersModal
          team={membersTeam}
          onClose={() => setMembersTeam(null)}
          canEdit={canEdit}
        />
      )}
    </div>
  );
};

export default TeamsPage;