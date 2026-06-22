import React from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
export { default as DetailModal } from './DetailModal';
export type { DetailField } from './DetailModal';

// ─── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <div className="spinner" style={{ width: size, height: size }} />
);

export const LoadingCenter: React.FC<{ text?: string }> = ({ text = 'Loading…' }) => (
  <div className="loading-center"><Spinner size={28} /><span>{text}</span></div>
);

// ─── Alert ────────────────────────────────────────────────────────────────────
export const Alert: React.FC<{ type?: 'error' | 'success'; message: string }> = ({ type = 'error', message }) => (
  <div className={`alert alert-${type}`}>
    {type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
    <span>{message}</span>
  </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
export const Modal: React.FC<{
  open: boolean; title: string; onClose: () => void; children: React.ReactNode;
  footer?: React.ReactNode; maxWidth?: number;
}> = ({ open, title, onClose, children, footer, maxWidth = 520 }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth }}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeColor = 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';

export const Badge: React.FC<{ color: BadgeColor; children: React.ReactNode }> = ({ color, children }) => (
  <span className={`badge badge-${color}`}>{children}</span>
);

export const statusColor = (status: string): BadgeColor => {
  const m: Record<string, BadgeColor> = {
    active: 'green', planning: 'blue', on_hold: 'yellow', completed: 'green', cancelled: 'red',
    todo: 'gray', in_progress: 'blue', testing: 'purple', blocked: 'red',
    pending: 'yellow', approved: 'green', rejected: 'red',
    planned: 'blue', low: 'gray', medium: 'yellow', high: 'red', critical: 'red',
    unpaid: 'gray', medical: 'purple', casual: 'blue', annual: 'green', emergency: 'red',
  };
  return m[status] ?? 'gray';
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <Badge color={statusColor(status)}>{status.replace(/_/g, ' ')}</Badge>
);

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
export const ConfirmModal: React.FC<{
  open: boolean; message: string;
  onConfirm: () => void; onCancel: () => void; loading?: boolean;
}> = ({ open, message, onConfirm, onCancel, loading }) => (
  <Modal open={open} title="Confirm Action" onClose={onCancel}
    footer={
      <>
        <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? <Spinner size={14} /> : 'Confirm'}
        </button>
      </>
    }
  >
    <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
  </Modal>
);

// ─── Pagination ───────────────────────────────────────────────────────────────
export const Pagination: React.FC<{
  page: number; totalPages: number; total: number; limit: number;
  onPage: (p: number) => void;
}> = ({ page, totalPages, total, limit, onPage }) => {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return (
    <div className="pagination">
      <span>Showing {from}–{to} of {total}</span>
      <div className="pagination-btns">
        <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>Prev</button>
        <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next</button>
      </div>
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
export const EmptyState: React.FC<{ message?: string; icon?: React.ReactNode }> = ({
  message = 'No records found', icon
}) => (
  <div className="empty-state">
    {icon}
    <p>{message}</p>
  </div>
);

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export const ProgressBar: React.FC<{ value: number; max?: number; color?: string }> = ({
  value, max = 100, color
}) => (
  <div className="progress-bar">
    <div className="progress-bar-fill" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }} />
  </div>
);

// ─── Tabs ─────────────────────────────────────────────────────────────────────
export const Tabs: React.FC<{
  tabs: string[]; active: string; onChange: (t: string) => void;
}> = ({ tabs, active, onChange }) => (
  <div className="tabs">
    {tabs.map((t) => (
      <button key={t} className={`tab ${active === t ? 'active' : ''}`} onClick={() => onChange(t)}>{t}</button>
    ))}
  </div>
);