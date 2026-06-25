import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { buildUpdateSet } from '../utils/sql';

const UPDATABLE_USER_FIELDS = ['first_name', 'phone', 'profile_image'] as const;

export const userRepository = {
  async findAll(page: number, limit: number, role?: string) {
    const offset = (page - 1) * limit;
    const listParams: unknown[] = [limit, offset];
    const countParams: unknown[] = [];
    let whereClause = '';

    if (role) {
      whereClause = 'WHERE role = $3';
      listParams.push(role);
      countParams.push(role);
    }

    const result = await query(
      `SELECT id, employee_id, first_name, email, phone, role, is_active, created_at
       FROM users ${whereClause}
       ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      listParams
    );
    const countWhere = role ? 'WHERE role = $1' : '';
    const count = await query(`SELECT COUNT(*) FROM users ${countWhere}`, countParams);
    return { rows: result.rows, total: parseInt(count.rows[0].count, 10) };
  },

  async findById(id: string) {
    const result = await query(
      `SELECT u.id, u.employee_id, u.first_name, u.email, u.phone, u.role,
              u.profile_image, u.is_active, u.created_at,
              em.total_tasks_assigned, em.total_tasks_completed, em.productivity_score, em.total_hours
       FROM users u
       LEFT JOIN employee_metrics em ON em.employee_id = u.id
       WHERE u.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async update(
    id: string,
    data: Partial<{ first_name: string; phone: string; profile_image: string }>
  ) {
    const { setClause, values } = buildUpdateSet(data, UPDATABLE_USER_FIELDS, 2);
    const result = await query(
      `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1
       RETURNING id, employee_id, first_name, email, phone, role, is_active, profile_image`,
      [id, ...values]
    );
    return result.rows[0];
  },

  async deactivate(id: string) {
    await query('UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = $1', [id]);
  },

  async activate(id: string) {
    await query('UPDATE users SET is_active = TRUE, updated_at = NOW() WHERE id = $1', [id]);
  },

  async getTeamMembers(teamId: string) {
    const result = await query(
      `SELECT u.id, u.employee_id, u.first_name, u.email, u.role,
              tm.joined_at
       FROM team_members tm
       JOIN users u ON u.id = tm.employee_id
       WHERE tm.team_id = $1 AND u.is_active = TRUE`,
      [teamId]
    );
    return result.rows;
  },

  async initMetrics(employeeId: string) {
    await query(
      `INSERT INTO employee_metrics (id, employee_id, total_tasks_assigned, total_tasks_completed, delayed_tasks, total_hours, productivity_score)
       VALUES ($1, $2, 0, 0, 0, 0, 0)
       ON CONFLICT (employee_id) DO NOTHING`,
      [uuidv4(), employeeId]
    );
  },
};
