import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export const leaveRepository = {
  async create(data: {
    employee_id: string; leave_type: string;
    start_date: Date; end_date: Date; reason: string;
  }) {
    const result = await query(
      `INSERT INTO leave_requests (id, employee_id, leave_type, start_date, end_date, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`,
      [uuidv4(), data.employee_id, data.leave_type, data.start_date, data.end_date, data.reason]
    );
    return result.rows[0];
  },

  async findAll(filters: { status?: string; employeeId?: string; page?: number; limit?: number }) {
    const { status, employeeId, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    if (status) { conditions.push(`lr.status = $${idx++}`); params.push(status); }
    if (employeeId) { conditions.push(`lr.employee_id = $${idx++}`); params.push(employeeId); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT lr.*,
              u.first_name || ' ' || u.last_name as employee_name,
              u.employee_id as emp_code,
              ab.first_name || ' ' || ab.last_name as approved_by_name
       FROM leave_requests lr
       JOIN users u ON u.id = lr.employee_id
       LEFT JOIN users ab ON ab.id = lr.approved_by
       ${where}
       ORDER BY lr.created_at DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      [...params, limit, offset]
    );
    const count = await query(
      `SELECT COUNT(*) FROM leave_requests lr ${where}`,
      params
    );
    return { rows: result.rows, total: parseInt(count.rows[0].count, 10) };
  },

  async findById(id: string) {
    const result = await query(
      `SELECT lr.*, u.first_name || ' ' || u.last_name as employee_name
       FROM leave_requests lr
       JOIN users u ON u.id = lr.employee_id
       WHERE lr.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async updateStatus(id: string, status: string, approvedBy: string | null) {
    const result = await query(
      `UPDATE leave_requests SET status = $1, approved_by = $2 WHERE id = $3 RETURNING *`,
      [status, approvedBy, id]
    );
    return result.rows[0];
  },

  async findActiveLeaveOnDate(employeeId: string, date: Date) {
    const result = await query(
      `SELECT * FROM leave_requests
       WHERE employee_id = $1 AND status = 'approved'
         AND start_date <= $2 AND end_date >= $2`,
      [employeeId, date]
    );
    return result.rows[0] || null;
  },
};
