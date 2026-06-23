import React, { useState, useCallback } from 'react';
import { Users, X } from 'lucide-react';
import { projectsApi, teamsApi } from '../api';
import { useApi } from '../hooks/useApi';
import { Modal, LoadingCenter, EmptyState } from '../components/common';
import type { Project, Team } from '../types';
import toast from 'react-hot-toast';

export const ProjectTeamsModal: React.FC<{ project: Project; onClose: () => void; canEdit: boolean }> = ({
  project,
  onClose,
  canEdit,
}) => {
  const { data: assignedTeams, loading, refetch } = useApi<Team[]>(
    useCallback(() => projectsApi.teams(project.id).then((r) => ({ data: { data: r.data.data } })), [project.id])
  );

  const { data: allTeams } = useApi<Team[]>(
    useCallback(() => teamsApi.list().then((r) => ({ data: { data: r.data.data } })), [])
  );

  const [addId, setAddId] = useState('');
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const assignedIds = new Set((assignedTeams || []).map((t) => t.id));
  const available = (allTeams || []).filter((t) => !assignedIds.has(t.id));

  const handleAdd = async () => {
    if (!addId) return;
    setAdding(true);
    try {
      await projectsApi.assignTeam(project.id, addId);
      toast.success('Team assigned to project');
      setAddId('');
      refetch();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to assign team');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (teamId: string) => {
    setRemovingId(teamId);
    try {
      await projectsApi.removeTeam(project.id, teamId);
      toast.success('Team removed from project');
      refetch();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to remove team');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Modal open title={`Teams — ${project.project_name}`} onClose={onClose} maxWidth={560}>
      {canEdit && (
        <div style={{
          display: 'flex', gap: 10, marginBottom: 20,
          padding: '12px 14px',
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
        }}>
          <select
            className="form-control"
            value={addId}
            onChange={(e) => setAddId(e.target.value)}
            style={{ flex: 1, minWidth: 0 }}
          >
            <option value="">Select team to assign…</option>
            {available.map((t) => (
              <option key={t.id} value={t.id}>
                {t.team_name}{t.department_name ? ` — ${t.department_name}` : ''}
              </option>
            ))}
          </select>
          <button
            className="btn btn-primary"
            onClick={handleAdd}
            disabled={adding || !addId}
            style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            {adding ? '…' : '+ Assign'}
          </button>
        </div>
      )}

      {loading ? (
        <LoadingCenter />
      ) : !assignedTeams || assignedTeams.length === 0 ? (
        <EmptyState icon={<Users size={32} />} message="No teams assigned yet. Assign one above." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {assignedTeams.map((t) => (
            <div
              key={t.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '.875rem', color: 'var(--text-primary)' }}>
                  {t.team_name}
                </div>
                <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>
                  {t.department_name || 'No department'}
                  {t.scrum_master_name ? ` · SM: ${t.scrum_master_name}` : ''}
                </div>
              </div>
              {canEdit && (
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={() => handleRemove(t.id)}
                  disabled={removingId === t.id}
                  title="Remove team from project"
                  style={{ color: 'var(--danger)', flexShrink: 0 }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {assignedTeams && assignedTeams.length > 0 && (
        <div style={{ marginTop: 12, fontSize: '.8125rem', color: 'var(--text-muted)', textAlign: 'right' }}>
          {assignedTeams.length} team{assignedTeams.length !== 1 ? 's' : ''} assigned
        </div>
      )}
    </Modal>
  );
};
