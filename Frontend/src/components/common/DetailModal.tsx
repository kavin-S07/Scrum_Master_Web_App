import React from 'react';
import { X, AlertCircle, Clock, User, ChevronRight } from 'lucide-react';
import { Spinner } from './index';

export interface DetailField {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}

export interface DetailUser {
  name: string;
  role: string;
  email?: string;
  employeeId?: string;
  department?: string;
  avatar?: string;
  avatarColor?: string;
}

export interface TimelineEntry {
  action: string;
  user: string;
  date: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface CommentEntry {
  id: string;
  user: string;
  avatar?: string;
  role?: string;
  text: string;
  date: string;
}

export interface DetailAction {
  label: string;
  onClick: () => void;
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  subtitle?: string;
  status?: { label: string; className: string };
  createdAt?: string;
  user?: DetailUser | null;
  fields?: DetailField[];
  timeline?: TimelineEntry[];
  comments?: CommentEntry[];
  actions?: DetailAction[];
  loading?: boolean;
  error?: string | null;
  children?: React.ReactNode;
}

const DetailModal: React.FC<DetailModalProps> = ({
  open, onClose, title, icon, subtitle, status, createdAt,
  user, fields, timeline, comments, actions, loading, error, children,
}) => {
  if (!open) return null;

  return (
    <div className="modal-overlay dm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dm" onClick={(e) => e.stopPropagation()}>
        <button className="dm-close" onClick={onClose}><X size={16} /></button>

        {/* ── Header ─────────────────────────────────── */}
        <div className="dm-header">
          <div className="dm-header-left">
            {icon && <div className="dm-header-icon">{icon}</div>}
            <div>
              <div className="dm-header-title-row">
                <h3 className="dm-title">{title}</h3>
                {status && <span className={`dm-status ${status.className}`}>{status.label}</span>}
              </div>
              {subtitle && <div className="dm-subtitle">{subtitle}</div>}
              {createdAt && (
                <div className="dm-created">
                  <Clock size={12} />
                  <span>Created {createdAt}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Body ───────────────────────────────────── */}
        <div className="dm-body">
          {loading ? (
            <div className="dm-loading">
              <Spinner size={22} />
              <span>Loading details…</span>
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          ) : (
            <>
              {/* User Card */}
              {user && (
                <div className="dm-user-card">
                  <div className="dm-user-avatar" style={{ background: user.avatarColor || 'var(--gradient-brand)' }}>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <span>{user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="dm-user-info">
                    <div className="dm-user-name">{user.name}</div>
                    <div className="dm-user-role">{user.role}</div>
                    {user.department && <div className="dm-user-dept">{user.department}</div>}
                    {user.email && <div className="dm-user-email">{user.email}</div>}
                    {user.employeeId && <div className="dm-user-email">ID: {user.employeeId}</div>}
                  </div>
                </div>
              )}

              {/* Detail Fields */}
              {fields && fields.length > 0 && (
                <div className="dm-fields">
                  {fields.map((f, i) => (
                    <div key={i} className={`dm-field ${f.fullWidth ? 'dm-field-full' : ''}`}>
                      <div className="dm-field-header">
                        {f.icon && <span className="dm-field-icon">{f.icon}</span>}
                        <span className="dm-field-label">{f.label}</span>
                      </div>
                      <div className="dm-field-value">{f.value ?? '—'}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Timeline */}
              {timeline && timeline.length > 0 && (
                <div className="dm-section">
                  <div className="dm-section-heading">
                    <span>Activity Timeline</span>
                  </div>
                  <div className="dm-timeline">
                    {timeline.map((t, i) => (
                      <div key={i} className={`dm-tl-item ${i === timeline.length - 1 ? 'dm-tl-last' : ''}`}>
                        <div className="dm-tl-line" />
                        <div className="dm-tl-dot">{t.icon || <ChevronRight size={10} />}</div>
                        <div className="dm-tl-content">
                          <div className="dm-tl-action">{t.action}</div>
                          <div className="dm-tl-meta">
                            <User size={10} /> {t.user} · {t.date}
                          </div>
                          {t.description && <div className="dm-tl-desc">{t.description}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              {comments && comments.length > 0 && (
                <div className="dm-section">
                  <div className="dm-section-heading">
                    <span>Comments & Activity</span>
                  </div>
                  <div className="dm-comments">
                    {comments.map((c) => (
                      <div key={c.id} className="dm-comment">
                        <div className="dm-comment-avatar" style={{ background: 'var(--gradient-brand)' }}>
                          {c.avatar ? <img src={c.avatar} alt={c.user} /> : c.user.charAt(0).toUpperCase()}
                        </div>
                        <div className="dm-comment-body">
                          <div className="dm-comment-head">
                            <span className="dm-comment-user">{c.user}</span>
                            {c.role && <span className="dm-comment-role">{c.role}</span>}
                            <span className="dm-comment-date">{c.date}</span>
                          </div>
                          <div className="dm-comment-text">{c.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {children}
            </>
          )}
        </div>

        {/* ── Footer Actions ─────────────────────────── */}
        {actions && actions.length > 0 && !loading && !error && (
          <div className="dm-footer">
            {actions.map((a, i) => {
              const cls = a.variant === 'primary' ? 'btn-primary'
                : a.variant === 'danger' ? 'btn-danger'
                : a.variant === 'ghost' ? 'btn-ghost'
                : 'btn-secondary';
              return (
                <button key={i} className={`btn btn-sm ${cls}`}
                  onClick={a.onClick} disabled={a.disabled}>
                  {a.icon}{a.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailModal;
