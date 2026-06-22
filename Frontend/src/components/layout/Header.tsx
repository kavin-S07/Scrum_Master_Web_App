import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { notificationsApi } from '../../api';
import type { Notification } from '../../types';
import { formatDistanceToNow } from 'date-fns';

const Header: React.FC<{ title: string; onMenuClick: () => void }> = ({ title, onMenuClick }) => {
  const { user } = useAuth();
  const { unreadCount, setUnreadCount } = useSocket();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const loadNotifs = useCallback(async () => {
    try {
      const res = await notificationsApi.list();
      setNotifs(res.data.data.notifications);
      setUnreadCount(res.data.data.unread);
    } catch { /* ignore */ }
  }, [setUnreadCount]);

  useEffect(() => { loadNotifs(); }, [loadNotifs]);

  const handleOpen = () => { setOpen((v) => !v); if (!open) loadNotifs(); };

  const markRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const initials = user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : '?';

  return (
    <header className="header">
      {/* Left: hamburger + page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-ghost btn-icon mobile-menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={18} />
        </button>
        <h1 className="header-title">{title}</h1>
      </div>

      {/* Right: search hint + bell + user chip */}
      <div className="header-right">
        {/* Search hint button (visual only — wired to keyboard shortcut if desired) */}
        <button
          className="btn btn-ghost btn-sm"
          style={{ display: 'none', gap: 8, color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '6px 12px' }}
          aria-label="Search"
        >
          <Search size={14} />
          <span style={{ fontSize: '.8125rem' }}>Search…</span>
          <kbd style={{ fontSize: '.625rem', background: 'var(--bg-elevated)', padding: '2px 5px', borderRadius: 4, border: '1px solid var(--border)', color: 'var(--text-muted)' }}>⌘K</kbd>
        </button>

        {/* Notification bell */}
        <div style={{ position: 'relative' }} ref={ref}>
          <button
            className="btn btn-ghost btn-icon notif-btn"
            onClick={handleOpen}
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {open && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <span style={{ fontWeight: 700, fontSize: '.9375rem', color: 'var(--text-primary)', letterSpacing: '-.01em' }}>
                  Notifications
                  {unreadCount > 0 && (
                    <span style={{ marginLeft: 8, background: 'var(--primary)', color: '#fff', fontSize: '.6875rem', padding: '2px 7px', borderRadius: 10, fontWeight: 700 }}>
                      {unreadCount}
                    </span>
                  )}
                </span>
                {unreadCount > 0 && (
                  <button className="btn btn-ghost btn-sm" onClick={markAllRead} style={{ fontSize: '.75rem' }}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="notif-list">
                {notifs.length === 0 ? (
                  <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.875rem' }}>
                    <Bell size={28} style={{ opacity: .3, display: 'block', margin: '0 auto 10px' }} />
                    All caught up!
                  </div>
                ) : notifs.map((n) => (
                  <div
                    key={n.id}
                    className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                    onClick={() => !n.is_read && markRead(n.id)}
                  >
                    <div className="notif-item-title">{n.title}</div>
                    <div className="notif-item-msg">{n.message}</div>
                    <div className="notif-item-time">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User chip */}
        <div className="header-user-chip">
          <div className="header-user-chip-avatar">{initials}</div>
          <span className="header-user-chip-name">{user?.first_name} {user?.last_name}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
