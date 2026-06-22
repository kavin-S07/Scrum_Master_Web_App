import { query } from '../config/database';

export const dashboardService = {
  async getAdminDashboard() {
    const [employees, teams, projects, sprints, pendingLeaves, taskStats] = await Promise.all([
      query('SELECT COUNT(*) FROM users WHERE role = $1 AND is_active = TRUE', ['employee']),
      query('SELECT COUNT(*) FROM teams'),
      query('SELECT COUNT(*) FROM projects'),
      query(`SELECT COUNT(*) FROM sprints WHERE sprint_status = 'active'`),
      query(`SELECT COUNT(*) FROM leave_requests WHERE status = 'pending'`),
      query(`
        SELECT
          COUNT(*) as total_tasks,
          COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
          COUNT(*) FILTER (WHERE status = 'blocked') as blocked_tasks,
          COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status != 'completed') as delayed_tasks
        FROM tasks
      `),
    ]);

    const projectsByStatus = await query(
      `SELECT status, COUNT(*)::int as count FROM projects GROUP BY status ORDER BY status`
    );

    const topPerformers = await query(
      `SELECT
         u.first_name || ' ' || u.last_name as name,
         COALESCE(COUNT(t.id) FILTER (WHERE ta.is_current = TRUE AND t.status = 'completed'), 0)::int as total_tasks_completed,
         CASE
           WHEN COUNT(t.id) FILTER (WHERE ta.is_current = TRUE) = 0 THEN 0
           ELSE ROUND(
             COUNT(t.id) FILTER (WHERE ta.is_current = TRUE AND t.status = 'completed') * 100.0 /
             COUNT(t.id) FILTER (WHERE ta.is_current = TRUE), 2
           )
         END::float as productivity_score
       FROM users u
       LEFT JOIN task_assignments ta ON ta.employee_id = u.id AND ta.is_current = TRUE
       LEFT JOIN tasks t ON t.id = ta.task_id
       WHERE u.role IN ('employee', 'scrum_master') AND u.is_active = TRUE
       GROUP BY u.id, u.first_name, u.last_name
       ORDER BY productivity_score DESC, total_tasks_completed DESC
       LIMIT 5`
    );

    const taskStatsRow = taskStats.rows[0] as Record<string, string>;
    return {
      overview: {
        total_employees: parseInt(employees.rows[0].count, 10),
        total_teams: parseInt(teams.rows[0].count, 10),
        total_projects: parseInt(projects.rows[0].count, 10),
        active_sprints: parseInt(sprints.rows[0].count, 10),
        pending_leaves: parseInt(pendingLeaves.rows[0].count, 10),
        total_tasks: parseInt(taskStatsRow.total_tasks, 10),
        completed_tasks: parseInt(taskStatsRow.completed_tasks, 10),
        blocked_tasks: parseInt(taskStatsRow.blocked_tasks, 10),
        delayed_tasks: parseInt(taskStatsRow.delayed_tasks, 10),
      },
      projects_by_status: projectsByStatus.rows.map((r: Record<string, unknown>) => ({
        status: r.status as string,
        count: String(r.count),
      })),
      top_performers: topPerformers.rows.map((r: Record<string, unknown>) => ({
        name: r.name as string,
        productivity_score: (r.productivity_score as number).toFixed(2),
        total_tasks_completed: r.total_tasks_completed as number,
      })),
    };
  },

  async getScrumMasterDashboard(scrumMasterId: string) {
    const teamsResult = await query(
      'SELECT id FROM teams WHERE scrum_master_id = $1',
      [scrumMasterId]
    );
    const teamIds = teamsResult.rows.map((t) => t.id);
    if (teamIds.length === 0) {
      return {
        active_sprints: [],
        task_overview: { total_tasks: 0, blocked_tasks: 0, overdue_tasks: 0 },
        pending_leaves: [],
        blocked_tasks: [],
      };
    }

    const [sprintStats, taskStats, pendingLeaves, blockedTasks] = await Promise.all([
      query(
        `SELECT s.*,
                COUNT(t.id) as total_tasks,
                COUNT(t.id) FILTER (WHERE t.status = 'completed') as completed_tasks,
                CASE WHEN COUNT(t.id) > 0
                  THEN ROUND(COUNT(t.id) FILTER (WHERE t.status = 'completed') * 100.0 / COUNT(t.id), 2)
                  ELSE 0 END as progress_percent
         FROM sprints s
         LEFT JOIN tasks t ON t.sprint_id = s.id
         WHERE s.sprint_status = 'active'
           AND s.project_id IN (
             SELECT project_id FROM project_teams WHERE team_id = ANY($1::uuid[])
           )
         GROUP BY s.id`,
        [teamIds]
      ),
      query(
        `SELECT
           COUNT(*) as total_tasks,
           COUNT(*) FILTER (WHERE t.status = 'blocked') as blocked_tasks,
           COUNT(*) FILTER (WHERE t.due_date < CURRENT_DATE AND t.status != 'completed') as overdue_tasks
         FROM tasks t
         JOIN task_assignments ta ON ta.task_id = t.id AND ta.is_current = TRUE
         JOIN team_members tm ON tm.employee_id = ta.employee_id AND tm.team_id = ANY($1::uuid[])`,
        [teamIds]
      ),
      query(
        `SELECT lr.*, u.first_name || ' ' || u.last_name as employee_name
         FROM leave_requests lr
         JOIN users u ON u.id = lr.employee_id
         JOIN team_members tm ON tm.employee_id = lr.employee_id
         WHERE tm.team_id = ANY($1::uuid[]) AND lr.status = 'pending'`,
        [teamIds]
      ),
      query(
        `SELECT t.*, u.first_name || ' ' || u.last_name as assigned_to
         FROM tasks t
         JOIN task_assignments ta ON ta.task_id = t.id AND ta.is_current = TRUE
         JOIN users u ON u.id = ta.employee_id
         JOIN team_members tm ON tm.employee_id = ta.employee_id AND tm.team_id = ANY($1::uuid[])
         WHERE t.status = 'blocked'`,
        [teamIds]
      ),
    ]);

    return {
      active_sprints: sprintStats.rows,
      task_overview: taskStats.rows[0],
      pending_leaves: pendingLeaves.rows,
      blocked_tasks: blockedTasks.rows,
    };
  },

  async getEmployeeDashboard(employeeId: string) {
    const [myTasks, todayTasks, completedTasks, myLeaves, workHours, sprintProgress] =
      await Promise.all([
        query(
          `SELECT t.* FROM tasks t
           JOIN task_assignments ta ON ta.task_id = t.id AND ta.is_current = TRUE
           WHERE ta.employee_id = $1 AND t.status != 'completed'
           ORDER BY t.due_date ASC`,
          [employeeId]
        ),
        query(
          `SELECT t.* FROM tasks t
           JOIN task_assignments ta ON ta.task_id = t.id AND ta.is_current = TRUE
           WHERE ta.employee_id = $1 AND t.due_date = CURRENT_DATE`,
          [employeeId]
        ),
        query(
          `SELECT COUNT(*) FROM tasks t
           JOIN task_assignments ta ON ta.task_id = t.id AND ta.is_current = TRUE
           WHERE ta.employee_id = $1 AND t.status = 'completed'`,
          [employeeId]
        ),
        query(
          `SELECT * FROM leave_requests WHERE employee_id = $1 ORDER BY created_at DESC LIMIT 5`,
          [employeeId]
        ),
        query(
          `SELECT COALESCE(SUM(worked_hours), 0) as total_hours_this_month
           FROM work_logs
           WHERE employee_id = $1
             AND DATE_TRUNC('month', log_date) = DATE_TRUNC('month', CURRENT_DATE)`,
          [employeeId]
        ),
        query(
          `SELECT s.sprint_name, s.end_date,
                  COUNT(t.id) as total_tasks,
                  COUNT(t.id) FILTER (WHERE t.status = 'completed') as completed_tasks
           FROM sprints s
           JOIN tasks t ON t.sprint_id = s.id
           JOIN task_assignments ta ON ta.task_id = t.id AND ta.is_current = TRUE
           WHERE ta.employee_id = $1 AND s.sprint_status = 'active'
           GROUP BY s.id`,
          [employeeId]
        ),
      ]);

    return {
      pending_tasks: myTasks.rows,
      today_tasks: todayTasks.rows,
      completed_tasks_count: parseInt(completedTasks.rows[0].count, 10),
      recent_leaves: myLeaves.rows,
      work_hours_this_month: workHours.rows[0].total_hours_this_month,
      sprint_progress: sprintProgress.rows,
    };
  },

  async getTeamProductivity(teamId: string) {
    const result = await query(
      `SELECT
         u.id,
         u.first_name || ' ' || u.last_name as name,
         COUNT(t.id) as total_tasks,
         COUNT(t.id) FILTER (WHERE t.status = 'completed') as completed_tasks,
         COUNT(t.id) FILTER (WHERE t.due_date < CURRENT_DATE AND t.status != 'completed') as overdue_tasks,
         COALESCE(SUM(wl.worked_hours), 0) as total_hours
       FROM team_members tm
       JOIN users u ON u.id = tm.employee_id
       LEFT JOIN task_assignments ta ON ta.employee_id = u.id AND ta.is_current = TRUE
       LEFT JOIN tasks t ON t.id = ta.task_id
       LEFT JOIN work_logs wl ON wl.employee_id = u.id
       WHERE tm.team_id = $1
       GROUP BY u.id, u.first_name, u.last_name`,
      [teamId]
    );
    return result.rows;
  },
};