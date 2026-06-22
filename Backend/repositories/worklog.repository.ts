import { withTransaction, query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export const workLogRepository = {
  async create(data: { task_id: string; employee_id: string; worked_hours: number; description: string; log_date: Date }) {
    // FIX: the log insert and the employee_metrics hour increment were two
    // separate, unrelated statements. If the metrics update failed (or the
    // process crashed between the two), the log would exist with no
    // corresponding hours recorded — silently wrong numbers on the
    // dashboard. Wrapping both in one transaction makes them succeed or
    // fail together. We also no longer assume an employee_metrics row
    // already exists (registration previously never created one — see
    // user.repository) by using an upsert instead of a plain UPDATE.
    return withTransaction(async (client) => {
      const result = await client.query(
        `INSERT INTO work_logs (id, task_id, employee_id, worked_hours, description, log_date)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [uuidv4(), data.task_id, data.employee_id, data.worked_hours, data.description, data.log_date]
      );

      await client.query(
        `INSERT INTO employee_metrics (id, employee_id, total_hours)
         VALUES ($1, $2, $3)
         ON CONFLICT (employee_id) DO UPDATE
           SET total_hours = employee_metrics.total_hours + EXCLUDED.total_hours,
               updated_at = NOW()`,
        [uuidv4(), data.employee_id, data.worked_hours]
      );

      return result.rows[0];
    });
  },

  async findByTask(taskId: string) {
    const result = await query(
      `SELECT wl.*, u.first_name || ' ' || u.last_name as employee_name
       FROM work_logs wl
       JOIN users u ON u.id = wl.employee_id
       WHERE wl.task_id = $1 ORDER BY wl.log_date DESC`,
      [taskId]
    );
    return result.rows;
  },

  async findByEmployee(employeeId: string, startDate?: Date, endDate?: Date) {
    const params: unknown[] = [employeeId];
    let dateFilter = '';
    if (startDate && endDate) {
      dateFilter = `AND wl.log_date BETWEEN $2 AND $3`;
      params.push(startDate, endDate);
    }
    const result = await query(
      `SELECT wl.*, t.title as task_title, p.project_name
       FROM work_logs wl
       JOIN tasks t ON t.id = wl.task_id
       JOIN projects p ON p.id = t.project_id
       WHERE wl.employee_id = $1 ${dateFilter}
       ORDER BY wl.log_date DESC`,
      params
    );
    return result.rows;
  },
};