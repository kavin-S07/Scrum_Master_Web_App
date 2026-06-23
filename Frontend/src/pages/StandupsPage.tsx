import React, { useState, useCallback } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { standupsApi, teamsApi } from '../api';
import { useApi } from '../hooks/useApi';
import {
  LoadingCenter,
  Alert,
  EmptyState,
  StatusBadge,
} from '../components/common';
import type { Standup, StandupRequest, Team } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const StandupsPage: React.FC = () => {
  const { user } = useAuth();
  const isEmployeeOnly = user?.role === 'employee';
  const isAdminOrSM = user?.role === 'admin' || user?.role === 'scrum_master';

  const today = new Date().toISOString().slice(0, 10);

  // Standup form state
  const [form, setForm] = useState<StandupRequest>({
    yesterday_work: '',
    today_plan: '',
    blockers: '',
    standup_date: today,
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof StandupRequest, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  // My standups
  const { data: myStandups, loading: loadingMy, error: errorMy, refetch: refetchMy } = useApi<Standup[]>(
    useCallback(() => standupsApi.my().then((r) => ({ data: { data: r.data.data } })), [])
  );

  // Team selection (admin/scrum_master only)
  const { data: teamsData } = useApi<Team[]>(
    useCallback(() => teamsApi.list().then((r) => ({ data: { data: r.data.data } })), [])
  );
  const teams = teamsData || [];

  const [selectedTeam, setSelectedTeam] = useState('');
  const [teamDate, setTeamDate] = useState(today);

  const { data: teamStandups, loading: loadingTeam } = useApi<Standup[]>(
    useCallback(
      () =>
        selectedTeam
          ? standupsApi.byTeam(selectedTeam, teamDate).then((r) => ({ data: { data: r.data.data } }))
          : Promise.resolve({ data: { data: [] as Standup[] } }),
      [selectedTeam, teamDate]
    )
  );

  const handleSubmitStandup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await standupsApi.submit(form);
      toast.success('Standup submitted');
      refetchMy();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Failed to submit standup');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Daily Standups</div>
          <div className="page-subtitle">
            {isEmployeeOnly ? 'Submit your daily update' : 'Manage team standups'}
          </div>
        </div>
      </div>

      <div className={isAdminOrSM ? 'two-col-grid' : ''}>
        {/* Standup Form */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Submit Standup</h3></div>
          <form onSubmit={handleSubmitStandup}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-control" type="date" value={form.standup_date}
                onChange={(e) => set('standup_date', e.target.value)}
                required max={today} />
            </div>
            <div className="form-group">
              <label className="form-label">What did you do yesterday? *</label>
              <textarea className="form-control" value={form.yesterday_work}
                onChange={(e) => set('yesterday_work', e.target.value)}
                required minLength={1} rows={3} />
            </div>
            <div className="form-group">
              <label className="form-label">What will you do today? *</label>
              <textarea className="form-control" value={form.today_plan}
                onChange={(e) => set('today_plan', e.target.value)}
                required minLength={1} rows={3} />
            </div>
            <div className="form-group">
              <label className="form-label">Blockers (optional)</label>
              <textarea className="form-control" value={form.blockers || ''}
                onChange={(e) => set('blockers', e.target.value)} rows={2} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : <><Send size={14} /> Submit Standup</>}
            </button>
          </form>
        </div>

        {/* Team Standups */}
        {isAdminOrSM && (
          <div className="card">
            <div className="card-header"><h3 className="card-title">Team Standups</h3></div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <select className="form-control" value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}>
                <option value="">Select team…</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.team_name}</option>)}
              </select>
              <input className="form-control" type="date" value={teamDate}
                onChange={(e) => setTeamDate(e.target.value)} max={today} />
            </div>

            {loadingTeam && <LoadingCenter />}
            {!selectedTeam && (
              <EmptyState icon={<MessageSquare size={36} />} message="Select a team to view standups" />
            )}
            {selectedTeam && teamStandups && (teamStandups as Standup[]).length === 0 && (
              <EmptyState message="No standups for this date" />
            )}
            {selectedTeam && teamStandups && (teamStandups as Standup[]).length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(teamStandups as Standup[]).map((s) => (
                  <div key={s.id} className="standup-card">
                    <div className="standup-card-header">
                      <strong>{s.employee_name || '—'}</strong>
                      <StatusBadge status={s.standup_date} />
                    </div>
                    <div className="standup-card-section">
                      <div className="detail-label">Yesterday</div>
                      <div>{s.yesterday_work}</div>
                    </div>
                    <div className="standup-card-section">
                      <div className="detail-label">Today</div>
                      <div>{s.today_plan}</div>
                    </div>
                    {s.blockers && (
                      <div className="standup-card-section">
                        <div className="detail-label">Blockers</div>
                        <div>{s.blockers}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* My Standup History */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><h3 className="card-title">My Standup History</h3></div>
        {loadingMy && <LoadingCenter />}
        {errorMy && <Alert message={errorMy} />}
        {myStandups && (myStandups as Standup[]).length === 0 && (
          <EmptyState icon={<MessageSquare size={36} />} message="No standups submitted yet" />
        )}
        {myStandups && (myStandups as Standup[]).length > 0 && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Yesterday</th>
                  <th>Today</th>
                  <th>Blockers</th>
                </tr>
              </thead>
              <tbody>
                {(myStandups as Standup[]).map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {new Date(s.standup_date).toLocaleDateString()}
                    </td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.yesterday_work}
                    </td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.today_plan}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {s.blockers || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StandupsPage;
