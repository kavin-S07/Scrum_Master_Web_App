import cron from 'node-cron';
import { query } from '../config/database';
import { notificationRepository } from '../repositories/notification.repository';
import logger from '../utils/logger';

// ─── Sprint ending soon reminder (daily at 9 AM) ──────────────────────────

export const sprintReminderJob = cron.schedule('0 9 * * *', async () => {
  logger.info('Running sprint reminder job');
  try {
    // Find sprints ending in 2 days
    const sprints = await query(
      `SELECT s.*, p.project_name FROM sprints s
       JOIN projects p ON p.id = s.project_id
       WHERE s.sprint_status = 'active'
         AND s.end_date = CURRENT_DATE + INTERVAL '2 days'`
    );

    for (const sprint of sprints.rows) {
      // Notify scrum masters
      const smResult = await query(
        `SELECT DISTINCT t.scrum_master_id FROM teams t
         JOIN project_teams pt ON pt.team_id = t.id
         WHERE pt.project_id = $1`,
        [sprint.project_id]
      );
      for (const sm of smResult.rows) {
        await notificationRepository.create(
          sm.scrum_master_id,
          '⚡ Sprint Ending Soon',
          `Sprint "${sprint.sprint_name}" in project "${sprint.project_name}" ends in 2 days.`
        );
      }
    }
    logger.info(`Sprint reminder sent for ${sprints.rows.length} sprints`);
  } catch (err) {
    logger.error('Sprint reminder job failed', err);
  }
}, { scheduled: false });

// ─── Delayed task check (daily at 8 AM) ───────────────────────────────────

export const delayedTaskJob = cron.schedule('0 8 * * *', async () => {
  logger.info('Running delayed task check job');
  try {
    const delayedTasks = await query(
      `SELECT t.*, ta.employee_id,
              u.first_name || ' ' || u.last_name as employee_name
       FROM tasks t
       JOIN task_assignments ta ON ta.task_id = t.id AND ta.is_current = TRUE
       JOIN users u ON u.id = ta.employee_id
       WHERE t.due_date < CURRENT_DATE AND t.status NOT IN ('completed', 'cancelled')`
    );

    // Update delayed count in metrics
    for (const task of delayedTasks.rows) {
      await notificationRepository.create(
        task.employee_id,
        '⚠️ Overdue Task',
        `Task "${task.title}" was due on ${task.due_date}. Please update its status.`
      );
    }

    // Update metrics
    await query(`
      UPDATE employee_metrics em
      SET delayed_tasks = (
        SELECT COUNT(*) FROM tasks t
        JOIN task_assignments ta ON ta.task_id = t.id AND ta.is_current = TRUE
        WHERE ta.employee_id = em.employee_id
          AND t.due_date < CURRENT_DATE AND t.status NOT IN ('completed', 'cancelled')
      ),
      updated_at = NOW()
    `);

    logger.info(`Processed ${delayedTasks.rows.length} delayed tasks`);
  } catch (err) {
    logger.error('Delayed task job failed', err);
  }
}, { scheduled: false });

// ─── Productivity score recalculation (weekly on Monday 6 AM) ─────────────

export const productivityJob = cron.schedule('0 6 * * 1', async () => {
  logger.info('Running productivity score job');
  try {
    await query(`
      UPDATE employee_metrics em
      SET
        total_tasks_assigned = (
          SELECT COUNT(*) FROM task_assignments ta WHERE ta.employee_id = em.employee_id
        ),
        total_tasks_completed = (
          SELECT COUNT(*) FROM tasks t
          JOIN task_assignments ta ON ta.task_id = t.id
          WHERE ta.employee_id = em.employee_id AND t.status = 'completed'
        ),
        productivity_score = CASE
          WHEN (SELECT COUNT(*) FROM task_assignments ta WHERE ta.employee_id = em.employee_id) = 0 THEN 0
          ELSE ROUND(
            (SELECT COUNT(*) FROM tasks t
             JOIN task_assignments ta ON ta.task_id = t.id
             WHERE ta.employee_id = em.employee_id AND t.status = 'completed') * 100.0 /
            (SELECT COUNT(*) FROM task_assignments ta WHERE ta.employee_id = em.employee_id)
          , 2)
        END,
        updated_at = NOW()
    `);
    logger.info('Productivity scores updated');
  } catch (err) {
    logger.error('Productivity job failed', err);
  }
}, { scheduled: false });

export const startAllJobs = () => {
  sprintReminderJob.start();
  delayedTaskJob.start();
  productivityJob.start();
  logger.info('All cron jobs started');
};