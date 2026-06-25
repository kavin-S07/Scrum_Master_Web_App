import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { buildUpdateSet } from '../utils/sql';

const UPDATABLE_TEAM_FIELDS = ['department_id', 'team_name', 'scrum_master_id'] as const;

export const teamRepository = {
  async findAll(departmentId?: string, scrumMasterId?: string) {
    const params: unknown[] = [];
    let where = '';
    let idx = 1;
    if (departmentId) {
      where = `WHERE t.department_id = $${idx}`;
      params.push(departmentId);
      idx++;
    }
    if (scrumMasterId) {
      where = where ? `${where} AND t.scrum_master_id = $${idx}` : `WHERE t.scrum_master_id = $${idx}`;
      params.push(scrumMasterId);
    }
    const result = await query(
      `SELECT t.*, d.name as department_name,
              u.first_name as scrum_master_name,
              COUNT(tm.id) as member_count
       FROM teams t
       LEFT JOIN departments d ON d.id = t.department_id
       LEFT JOIN users u ON u.id = t.scrum_master_id
       LEFT JOIN team_members tm ON tm.team_id = t.id
       ${where}
       GROUP BY t.id, d.name, u.first_name
       ORDER BY t.created_at DESC`,
      params
    );
    return result.rows;
  },

  async findById(id: string) {
    const result = await query(
      `SELECT t.*, d.name as department_name,
              u.first_name as scrum_master_name
       FROM teams t
       LEFT JOIN departments d ON d.id = t.department_id
       LEFT JOIN users u ON u.id = t.scrum_master_id
       WHERE t.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async create(data: { department_id: string; team_name: string; scrum_master_id: string }) {
    const result = await query(
      'INSERT INTO teams (id, department_id, team_name, scrum_master_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [uuidv4(), data.department_id, data.team_name, data.scrum_master_id]
    );
    return result.rows[0];
  },

  async update(
    id: string,
    data: Partial<{ department_id: string; team_name: string; scrum_master_id: string }>
  ) {
    const { setClause, values } = buildUpdateSet(data, UPDATABLE_TEAM_FIELDS, 2);
    const result = await query(
      `UPDATE teams SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0] || null;
  },

  async addMember(teamId: string, employeeId: string) {
    const existing = await query(
      'SELECT id FROM team_members WHERE team_id = $1 AND employee_id = $2',
      [teamId, employeeId]
    );
    if (existing.rows.length > 0) return existing.rows[0];
    const result = await query(
      'INSERT INTO team_members (id, team_id, employee_id) VALUES ($1, $2, $3) RETURNING *',
      [uuidv4(), teamId, employeeId]
    );
    return result.rows[0];
  },

  async removeMember(teamId: string, employeeId: string) {
    await query('DELETE FROM team_members WHERE team_id = $1 AND employee_id = $2', [teamId, employeeId]);
  },

  async getMembers(teamId: string) {
    const result = await query(
      `SELECT u.id, u.employee_id, u.first_name, u.email, u.role, tm.joined_at
       FROM team_members tm
       JOIN users u ON u.id = tm.employee_id
       WHERE tm.team_id = $1`,
      [teamId]
    );
    return result.rows;
  },

  async findByScrumMaster(scrumMasterId: string) {
    const result = await query('SELECT * FROM teams WHERE scrum_master_id = $1', [scrumMasterId]);
    return result.rows;
  },
};