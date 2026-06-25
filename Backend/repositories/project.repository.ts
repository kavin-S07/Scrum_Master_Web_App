import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { buildUpdateSet } from '../utils/sql';

const UPDATABLE_PROJECT_FIELDS = [
  'project_name',
  'description',
  'start_date',
  'end_date',
  'status',
] as const;

export const projectRepository = {
  async findAll(page: number, limit: number, status?: string) {
    const offset = (page - 1) * limit;
    const listParams: unknown[] = [limit, offset];
    const countParams: unknown[] = [];
    let where = '';
    if (status) {
      // FIX: see user.repository.findAll — the count query previously
      // reused a $3-based WHERE clause but only received one bound param.
      where = 'WHERE p.status = $3';
      listParams.push(status);
      countParams.push(status);
    }

    const result = await query(
      `SELECT p.*, u.first_name as created_by_name,
              COUNT(DISTINCT s.id) as total_sprints,
              COUNT(DISTINCT pt.team_id) as total_teams
       FROM projects p
       LEFT JOIN users u ON u.id = p.created_by
       LEFT JOIN sprints s ON s.project_id = p.id
       LEFT JOIN project_teams pt ON pt.project_id = p.id
       ${where}
       GROUP BY p.id, u.first_name
       ORDER BY p.created_at DESC LIMIT $1 OFFSET $2`,
      listParams
    );
    const countWhere = status ? 'WHERE p.status = $1' : '';
    const count = await query(`SELECT COUNT(*) FROM projects p ${countWhere}`, countParams);
    return { rows: result.rows, total: parseInt(count.rows[0].count, 10) };
  },

  async findById(id: string) {
    const result = await query(
      `SELECT p.*, u.first_name as created_by_name
       FROM projects p
       LEFT JOIN users u ON u.id = p.created_by
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async create(data: {
    project_name: string; project_code: string; description?: string;
    start_date: Date; end_date: Date; status: string; created_by: string;
  }) {
    const result = await query(
      `INSERT INTO projects (id, project_name, project_code, description, start_date, end_date, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [uuidv4(), data.project_name, data.project_code, data.description || null,
       data.start_date, data.end_date, data.status, data.created_by]
    );
    return result.rows[0];
  },

  async update(id: string, data: Partial<{
    project_name: string; description: string; start_date: Date; end_date: Date; status: string;
  }>) {
    const { setClause, values } = buildUpdateSet(data, UPDATABLE_PROJECT_FIELDS, 2);
    const result = await query(
      `UPDATE projects SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0] || null;
  },

  async delete(id: string) {
    await query('DELETE FROM projects WHERE id = $1', [id]);
  },

  async assignTeam(projectId: string, teamId: string) {
    const existing = await query(
      'SELECT id FROM project_teams WHERE project_id = $1 AND team_id = $2',
      [projectId, teamId]
    );
    if (existing.rows.length > 0) return existing.rows[0];
    const result = await query(
      'INSERT INTO project_teams (id, project_id, team_id) VALUES ($1, $2, $3) RETURNING *',
      [uuidv4(), projectId, teamId]
    );
    return result.rows[0];
  },

  async removeTeam(projectId: string, teamId: string) {
    await query('DELETE FROM project_teams WHERE project_id = $1 AND team_id = $2', [projectId, teamId]);
  },

  async getProjectTeams(projectId: string) {
    const result = await query(
      `SELECT t.*, d.name as department_name,
              u.first_name as scrum_master_name
       FROM project_teams pt
       JOIN teams t ON t.id = pt.team_id
       LEFT JOIN departments d ON d.id = t.department_id
       LEFT JOIN users u ON u.id = t.scrum_master_id
       WHERE pt.project_id = $1`,
      [projectId]
    );
    return result.rows;
  },
};