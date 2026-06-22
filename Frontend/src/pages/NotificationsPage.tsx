import React, { useState, useCallback } from 'react';
import { Bell, CheckCheck, Mail, MailOpen, RefreshCw } from 'lucide-react';
import { notificationsApi } from '../api';
import { useApi } from '../hooks/useApi';
import {
  LoadingCenter,
  Alert,
  EmptyState,
  Pagination,
} from '../components/common';
import type { Notification, NotificationsResponse } from '../types';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';

const NotificationsPage: React.FC = () => {
  const { unreadCount, setUnreadCount } = useSocket();
  const [page, setPage] = useState(1);

  const { data, pagination, loading, error, refetch } = useApi<NotificationsResponse>(
    useCallback(
      () => notificationsApi.list(page).then((r) => ({ data: { data: r.data.data } })),
      [page]
    )
  );

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setUnreadCount((prev: number) => Math.max(0, prev - 1));
      refetch();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setUnreadCount(0);
      refetch();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to mark all as read');
    }
  };

  const formatTime = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const notifData = data as NotificationsResponse | undefined;
  const notifications = notifData?.notifications || [];
  const total = notifData?.total || 0;
  const totalPages = pagination?.totalPages || 1;
  const limit = pagination?.limit || 20;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">
            Notifications
            {unreadCount > 0 && (
              <span className="badge badge-red" style={{ marginLeft: 8, fontSize: '.75rem' }}>
                {unreadCount} unread
              </span>
            )}
          </div>
          <div className="page-subtitle">Stay updated with recent activity</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={handleMarkAllRead}
            disabled={unreadCount === 0}>
            <CheckCheck size={14} /> Mark All Read
          </button>
          <button className="btn btn-ghost btn-icon" onClick={refetch} title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {loading && <LoadingCenter />}
      {error && <Alert message={error} />}

      <div className="card">
        {notifications.length === 0 ? (
          <EmptyState icon={<Bell size={40} />} message="No notifications yet" />
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {notifications.map((n: Notification) => (
                <div
                  key={n.id}
                  className={`notification-item ${!n.is_read ? 'notification-item-unread' : ''}`}
                  onClick={() => !n.is_read && handleMarkRead(n.id)}
                >
                  <div className="notification-item-icon">
                    {n.is_read ? <MailOpen size={16} /> : <Mail size={16} />}
                  </div>
                  <div className="notification-item-body">
                    <div className="notification-item-title">{n.title}</div>
                    <div className="notification-item-message">{n.message}</div>
                    <div className="notification-item-time">{formatTime(n.created_at)}</div>
                  </div>
                  {!n.is_read && (
                    <button className="btn btn-ghost btn-sm notification-item-action"
                      onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}>
                      Mark read
                    </button>
                  )}
                </div>
              ))}
            </div>
            {total > limit && (
              <Pagination page={page} totalPages={totalPages} total={total}
                limit={limit} onPage={setPage} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
