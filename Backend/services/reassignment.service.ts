import { withTransaction, query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { taskRepository } from '../repositories/task.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';

interface TeamMemberWorkload {
  id: string;
  first_name: string;
  active_tasks: number;
  total_story_points: number;
  workload_score: number;
}

export const reassignmentService = {
  /**
   * Core algorithm: when a leave is approved, find all active tasks of the
   * employee and redistribute to team members with the lowest workload.
   */
  async handleLeaveApproval(employeeId: string, teamId: string, reassignedBy: string) {
    logger.info(`Starting smart reassignment for employee ${employeeId}`);

    const activeTasks = await taskRepository.findActiveTasksByEmployee(employeeId);
    if (activeTasks.length === 0) {
      logger.info('No active tasks to reassign');
      return { reassigned: 0, tasks: [] };
    }

    const membersResult = await query(
      `SELECT u.id, u.first_name
       FROM team_members tm
       JOIN users u ON u.id = tm.employee_id
       WHERE tm.team_id = $1 AND u.id != $2 AND u.is_active = TRUE AND u.role = 'employee'`,
      [teamId, employeeId]
    );
    const members = membersResult.rows as { id: string; first_name: string }[];

    if (members.length === 0) {
      logger.warn(`No available team members in team ${teamId} for reassignment`);
      return { reassigned: 0, tasks: [] };
    }

    const workloads: TeamMemberWorkload[] = await Promise.all(
      members.map(async (m) => {
        const wl = await taskRepository.getWorkload(m.id);
        const activeTaskCount = parseInt(wl.active_tasks || '0', 10);
        const storyPoints = parseInt(wl.total_story_points || '0', 10);
        return {
          id: m.id,
          first_name: m.first_name,
          active_tasks: activeTaskCount,
          total_story_points: storyPoints,
          // Weighted score: tasks 40%, story points 60%
          workload_score: activeTaskCount * 0.4 + storyPoints * 0.6,
        };
      })
    );

    workloads.sort((a, b) =>
      a.workload_score !== b.workload_score
        ? a.workload_score - b.workload_score
        : a.id.localeCompare(b.id)
    );

    const reassigned: { task_id: string; task_title: string; assigned_to: string }[] = [];

    for (let i = 0; i < activeTasks.length; i++) {
      const task = activeTasks[i];
      const targetMember = workloads[i % workloads.length];

      // FIX: "unassign the old employee + assign the new one + write the
      // audit record" is one logical operation. The original ran these as
      // three independent statements; if the process crashed or the audit
      // insert failed partway through, a task could end up reassigned with
      // no history record (or vice versa). withTransaction makes the trio
      // atomic per task.
      await withTransaction(async (client) => {
        await taskRepository.assignEmployee(task.id, targetMember.id, reassignedBy, client);
        await client.query(
          `INSERT INTO task_reassignments (id, task_id, old_employee, new_employee, reason, reassigned_by)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            uuidv4(),
            task.id,
            employeeId,
            targetMember.id,
            'Automatic reassignment due to approved leave',
            reassignedBy,
          ]
        );
      });

      // Best-effort notification — a delivery failure here shouldn't undo
      // an already-committed reassignment.
      await notificationRepository.create(
        targetMember.id,
        'Task Assigned to You',
        `Task "${task.title}" has been reassigned to you due to a team member's leave.`
      );

      workloads[i % workloads.length].workload_score +=
        (task.story_points || 1) * 0.6 + 0.4;

      reassigned.push({
        task_id: task.id,
        task_title: task.title,
        assigned_to: targetMember.first_name,
      });
    }

    await notificationRepository.create(
      employeeId,
      'Your Tasks Have Been Reassigned',
      `Your ${activeTasks.length} task(s) have been automatically reassigned to team members during your leave.`
    );

    logger.info(`Reassigned ${reassigned.length} tasks for employee ${employeeId}`);
    return { reassigned: reassigned.length, tasks: reassigned };
  },

  async manualReassign(taskId: string, newEmployeeId: string, reason: string, reassignedBy: string) {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new AppError('Task not found', 404);

    const oldEmployeeId = task.assigned_to_id || null;

    await withTransaction(async (client) => {
      await taskRepository.assignEmployee(taskId, newEmployeeId, reassignedBy, client);
      await client.query(
        `INSERT INTO task_reassignments (id, task_id, old_employee, new_employee, reason, reassigned_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [uuidv4(), taskId, oldEmployeeId, newEmployeeId, reason, reassignedBy]
      );
    });

    await notificationRepository.create(
      newEmployeeId,
      'New Task Assigned',
      `Task "${task.title}" has been assigned to you. Reason: ${reason}`
    );

    return task;
  },

  async getReassignmentHistory(taskId?: string, employeeId?: string) {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (taskId) {
      conditions.push(`tr.task_id = $${idx++}`);
      params.push(taskId);
    }
    if (employeeId) {
      conditions.push(`(tr.old_employee = $${idx} OR tr.new_employee = $${idx})`);
      params.push(employeeId);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await query(
      `SELECT tr.*,
              t.title as task_title,
              oe.first_name as old_employee_name,
              ne.first_name as new_employee_name,
              rb.first_name as reassigned_by_name
       FROM task_reassignments tr
       JOIN tasks t ON t.id = tr.task_id
       LEFT JOIN users oe ON oe.id = tr.old_employee
       JOIN users ne ON ne.id = tr.new_employee
       JOIN users rb ON rb.id = tr.reassigned_by
       ${where}
       ORDER BY tr.reassigned_at DESC`,
      params
    );
    return result.rows;
  },
};