import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { emitToUser } from '../socket';

export const notificationRepository = {
  async create(userId: string, title: string, message: string) {
    const result = await query(
      `INSERT INTO notifications (id, user_id, title, message) VALUES ($1, $2, $3, $4) RETURNING *`,
      [uuidv4(), userId, title, message]
    );
    const notification = result.rows[0];

    // FIX: socket.io was fully wired up (connection auth, per-user rooms,
    // an `emitToUser` helper) but nothing in the codebase ever called it —
    // every notification was DB-only and required a page refresh/poll to
    // see. This pushes it to the user's socket room in real time if
    // they're connected; it's a no-op (not an error) if they aren't.
    emitToUser(userId, 'notification:new', notification);

    return notification;
  },

  async findByUser(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const result = await query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    const count = await query('SELECT COUNT(*) FROM notifications WHERE user_id = $1', [userId]);
    const unread = await query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE',
      [userId]
    );
    return {
      rows: result.rows,
      total: parseInt(count.rows[0].count, 10),
      unread: parseInt(unread.rows[0].count, 10),
    };
  },

  async markRead(id: string, userId: string) {
    await query('UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2', [id, userId]);
  },

  async markAllRead(userId: string) {
    await query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1', [userId]);
  },
};