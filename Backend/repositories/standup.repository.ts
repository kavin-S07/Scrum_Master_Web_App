import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export const standupRepository = {
  async create(data: { employee_id: string; yesterday_work: string; today_plan: string; blockers: string; standup_date: Date }) {
    // FIX: the original "check if a row exists, then INSERT or UPDATE"
    // pattern has a race condition — two near-simultaneous submissions for
    // the same employee/date could both see "no existing row" and both
    // attempt an INSERT, with the second failing on the
    // UNIQUE(employee_id, standup_date) constraint instead of being treated
    // as an update. An atomic upsert removes the race entirely.
    const result = await query(
      `INSERT INTO standups (id, employee_id, yesterday_work, today_plan, blockers, standup_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (employee_id, standup_date) DO UPDATE
         SET yesterday_work = EXCLUDED.yesterday_work,
             today_plan = EXCLUDED.today_plan,
             blockers = EXCLUDED.blockers
       RETURNING *`,
      [uuidv4(), data.employee_id, data.yesterday_work, data.today_plan, data.blockers, data.standup_date]
    );
    return result.rows[0];
  },

  async findByTeamAndDate(teamId: string, date: Date) {
    const result = await query(
      `SELECT s.*, u.first_name as employee_name, u.employee_id as emp_code
       FROM standups s
       JOIN users u ON u.id = s.employee_id
       JOIN team_members tm ON tm.employee_id = s.employee_id
       WHERE tm.team_id = $1 AND s.standup_date = $2`,
      [teamId, date]
    );
    return result.rows;
  },

  async findByEmployee(employeeId: string, limit = 7) {
    const result = await query(
      `SELECT * FROM standups WHERE employee_id = $1 ORDER BY standup_date DESC LIMIT $2`,
      [employeeId, limit]
    );
    return result.rows;
  },
};