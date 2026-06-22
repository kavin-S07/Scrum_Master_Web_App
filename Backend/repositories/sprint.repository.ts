import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { buildUpdateSet } from '../utils/sql';

const UPDATABLE_SPRINT_FIELDS = ['sprint_name', 'goal', 'start_date', 'end_date', 'sprint_status'] as const;

export const sprintRepository = {
  async findByProject(projectId: string) {
    const result = await query(
      `SELECT s.*,
              COUNT(t.id) as total_tasks,
              COUNT(t.id) FILTER (WHERE t.status = 'completed') as completed_tasks,
              COALESCE(SUM(t.story_points), 0) as total_story_points,
              COALESCE(SUM(t.story_points) FILTER (WHERE t.status = 'completed'), 0) as completed_story_points
       FROM sprints s
       LEFT JOIN tasks t ON t.sprint_id = s.id
       WHERE s.project_id = $1
       GROUP BY s.id
       ORDER BY s.start_date DESC`,
      [projectId]
    );
    return result.rows;
  },

  async findById(id: string) {
    const result = await query(
      `SELECT s.*,
              p.project_name,
              COUNT(t.id) as total_tasks,
              COUNT(t.id) FILTER (WHERE t.status = 'completed') as completed_tasks,
              COALESCE(SUM(t.story_points), 0) as total_story_points,
              COALESCE(SUM(t.story_points) FILTER (WHERE t.status = 'completed'), 0) as completed_story_points
       FROM sprints s
       LEFT JOIN projects p ON p.id = s.project_id
       LEFT JOIN tasks t ON t.sprint_id = s.id
       WHERE s.id = $1
       GROUP BY s.id, p.project_name`,
      [id]
    );
    return result.rows[0] || null;
  },

  async create(data: {
    project_id: string; sprint_name: string; goal?: string;
    start_date: Date; end_date: Date; sprint_status: string; created_by: string;
  }) {
    const result = await query(
      `INSERT INTO sprints (id, project_id, sprint_name, goal, start_date, end_date, sprint_status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [uuidv4(), data.project_id, data.sprint_name, data.goal || null,
       data.start_date, data.end_date, data.sprint_status, data.created_by]
    );
    return result.rows[0];
  },

  async update(id: string, data: Partial<{
    sprint_name: string; goal: string; start_date: Date; end_date: Date; sprint_status: string;
  }>) {
    const { setClause, values } = buildUpdateSet(data, UPDATABLE_SPRINT_FIELDS, 2);
    const result = await query(
      `UPDATE sprints SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  },

  async delete(id: string) {
    await query('DELETE FROM sprints WHERE id = $1', [id]);
  },

  async findActiveSprints() {
    const result = await query(
      `SELECT s.*, p.project_name FROM sprints s
       JOIN projects p ON p.id = s.project_id
       WHERE s.sprint_status = 'active' AND s.end_date >= CURRENT_DATE`,
    );
    return result.rows;
  },

  async getBurndownData(sprintId: string) {
    const sprint = await this.findById(sprintId);
    if (!sprint) return null;

    const result = await query(
      `SELECT
         t.due_date as date,
         SUM(t.story_points) FILTER (WHERE t.status != 'completed') as remaining_points,
         SUM(t.story_points) FILTER (WHERE t.status = 'completed') as completed_points
       FROM tasks t
       WHERE t.sprint_id = $1
       GROUP BY t.due_date
       ORDER BY t.due_date`,
      [sprintId]
    );

    return {
      sprint: {
        id: sprint.id,
        sprint_name: sprint.sprint_name,
        start_date: sprint.start_date,
        end_date: sprint.end_date,
        total_story_points: sprint.total_story_points || 0,
      },
      burndown: result.rows.map((r) => ({
        date: (r as { date: Date }).date,
        remaining_points: parseFloat((r as { remaining_points: string | null }).remaining_points || '0'),
      })),
    };
  },
};