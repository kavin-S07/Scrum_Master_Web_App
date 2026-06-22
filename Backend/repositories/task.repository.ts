import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { buildUpdateSet } from '../utils/sql';
import type { PoolClient, QueryResult, QueryResultRow } from 'pg';

const UPDATABLE_TASK_FIELDS = ['title', 'description', 'priority', 'status', 'story_points', 'due_date', 'sprint_id'] as const;

export const taskRepository = {
  async findAll(filters: {
    sprintId?: string; projectId?: string; employeeId?: string;
    status?: string; priority?: string; page?: number; limit?: number;
  }) {
    const { sprintId, projectId, employeeId, status, priority, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (sprintId) { conditions.push(`t.sprint_id = $${idx++}`); params.push(sprintId); }
    if (projectId) { conditions.push(`t.project_id = $${idx++}`); params.push(projectId); }
    if (status) { conditions.push(`t.status = $${idx++}`); params.push(status); }
    if (priority) { conditions.push(`t.priority = $${idx++}`); params.push(priority); }
    if (employeeId) {
      conditions.push(`ta.employee_id = $${idx++} AND ta.is_current = TRUE`);
      params.push(employeeId);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const join = employeeId ? 'JOIN task_assignments ta ON ta.task_id = t.id' : 'LEFT JOIN task_assignments ta ON ta.task_id = t.id AND ta.is_current = TRUE';

    const result = await query(
      `SELECT t.*,
              p.project_name,
              s.sprint_name,
              u.first_name || ' ' || u.last_name as assigned_to_name,
              ta.employee_id as assigned_to_id
       FROM tasks t
       LEFT JOIN projects p ON p.id = t.project_id
       LEFT JOIN sprints s ON s.id = t.sprint_id
       ${join}
       LEFT JOIN users u ON u.id = ta.employee_id
       ${where}
       ORDER BY t.due_date ASC, t.priority DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      [...params, limit, offset]
    );
    const countResult = await query(
      `SELECT COUNT(*) FROM tasks t ${join} ${where}`,
      params
    );
    return { rows: result.rows, total: parseInt(countResult.rows[0].count) };
  },

  async findById(id: string) {
    const result = await query(
      `SELECT t.*,
              p.project_name,
              s.sprint_name,
              u.first_name || ' ' || u.last_name as assigned_to_name,
              ta.employee_id as assigned_to_id,
              creator.first_name || ' ' || creator.last_name as created_by_name
       FROM tasks t
       LEFT JOIN projects p ON p.id = t.project_id
       LEFT JOIN sprints s ON s.id = t.sprint_id
       LEFT JOIN task_assignments ta ON ta.task_id = t.id AND ta.is_current = TRUE
       LEFT JOIN users u ON u.id = ta.employee_id
       LEFT JOIN users creator ON creator.id = t.created_by
       WHERE t.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async create(data: {
    sprint_id?: string; project_id: string; title: string; description?: string;
    priority: string; status: string; story_points?: number; due_date?: Date; created_by: string;
  }) {
    const result = await query(
      `INSERT INTO tasks (id, sprint_id, project_id, title, description, priority, status, story_points, due_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [uuidv4(), data.sprint_id || null, data.project_id, data.title, data.description || null,
       data.priority, data.status, data.story_points || null, data.due_date || null, data.created_by]
    );
    return result.rows[0];
  },

  async update(id: string, data: Partial<{
    title: string; description: string; priority: string; status: string;
    story_points: number; due_date: Date; sprint_id: string;
  }>) {
    const { setClause, values } = buildUpdateSet(data, UPDATABLE_TASK_FIELDS, 2);
    const result = await query(
      `UPDATE tasks SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  },

  async delete(id: string) {
    await query('DELETE FROM tasks WHERE id = $1', [id]);
  },

  async assignEmployee(taskId: string, employeeId: string, assignedBy: string, client?: PoolClient) {
    const runQuery = client
      ? (text: string, params?: unknown[]) => client.query(text, params)
      : query;
    await runQuery('UPDATE task_assignments SET is_current = FALSE WHERE task_id = $1', [taskId]);
    const result = await runQuery(
      `INSERT INTO task_assignments (id, task_id, employee_id, assigned_by, is_current)
       VALUES ($1, $2, $3, $4, TRUE) RETURNING *`,
      [uuidv4(), taskId, employeeId, assignedBy]
    );
    return result.rows[0];
  },

  async getAssignmentHistory(taskId: string) {
    const result = await query(
      `SELECT ta.*, u.first_name || ' ' || u.last_name as employee_name,
              ab.first_name || ' ' || ab.last_name as assigned_by_name
       FROM task_assignments ta
       JOIN users u ON u.id = ta.employee_id
       JOIN users ab ON ab.id = ta.assigned_by
       WHERE ta.task_id = $1
       ORDER BY ta.assigned_at DESC`,
      [taskId]
    );
    return result.rows;
  },

  async findActiveTasksByEmployee(employeeId: string) {
    const result = await query(
      `SELECT t.* FROM tasks t
       JOIN task_assignments ta ON ta.task_id = t.id AND ta.is_current = TRUE
       WHERE ta.employee_id = $1 AND t.status NOT IN ('completed', 'cancelled')`,
      [employeeId]
    );
    return result.rows;
  },

  async getWorkload(employeeId: string) {
    const result = await query(
      `SELECT
         COUNT(t.id) as active_tasks,
         COALESCE(SUM(t.story_points), 0) as total_story_points
       FROM tasks t
       JOIN task_assignments ta ON ta.task_id = t.id AND ta.is_current = TRUE
       WHERE ta.employee_id = $1 AND t.status NOT IN ('completed', 'cancelled')`,
      [employeeId]
    );
    return result.rows[0];
  },
};