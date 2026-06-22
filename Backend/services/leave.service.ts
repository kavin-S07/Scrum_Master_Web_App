import { leaveRepository } from '../repositories/leave.repository';
import { reassignmentService } from './reassignment.service';
import { notificationRepository } from '../repositories/notification.repository';
import { AppError } from '../utils/AppError';
import { query } from '../config/database';
import logger from '../utils/logger';

export const leaveService = {
  async requestLeave(employeeId: string, data: {
    leave_type: string; start_date: Date; end_date: Date; reason: string;
  }) {
    const overlap = await query(
      `SELECT id FROM leave_requests
       WHERE employee_id = $1 AND status != 'rejected'
         AND (start_date, end_date) OVERLAPS ($2, $3)`,
      [employeeId, data.start_date, data.end_date]
    );
    if (overlap.rows.length > 0) {
      throw new AppError('You already have a leave request overlapping these dates', 409);
    }
    return leaveRepository.create({ employee_id: employeeId, ...data });
  },

  async getLeaves(filters: { status?: string; employeeId?: string; page?: number; limit?: number }) {
    return leaveRepository.findAll(filters);
  },

  async getLeaveById(id: string) {
    const leave = await leaveRepository.findById(id);
    if (!leave) throw new AppError('Leave request not found', 404);
    return leave;
  },

  async approveOrReject(leaveId: string, status: 'approved' | 'rejected', approverId: string) {
    const leave = await leaveRepository.findById(leaveId);
    if (!leave) throw new AppError('Leave request not found', 404);
    if (leave.status !== 'pending') throw new AppError('Leave request is already processed', 400);

    const updated = await leaveRepository.updateStatus(leaveId, status, approverId);

    await notificationRepository.create(
      leave.employee_id,
      `Leave Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      `Your ${leave.leave_type} leave from ${leave.start_date} to ${leave.end_date} has been ${status}.`
    );

    if (status === 'approved') {
      // Reassign across every team the employee belongs to, not just the
      // first one found — the original only ever looked at a single row
      // (`LIMIT 1`), so an employee on more than one team would have tasks
      // on their other teams silently never redistributed.
      const teamRows = await query<{ team_id: string }>(
        `SELECT team_id FROM team_members WHERE employee_id = $1`,
        [leave.employee_id]
      );
      for (const { team_id } of teamRows.rows) {
        try {
          await reassignmentService.handleLeaveApproval(leave.employee_id, team_id, approverId);
        } catch (err) {
          // One team's reassignment failing shouldn't block the leave
          // approval itself or stop reassignment on the employee's other
          // teams — log and continue.
          logger.error(`Reassignment failed for team ${team_id} on leave ${leaveId}`, err);
        }
      }
    }

    return updated;
  },

  async cancelLeave(leaveId: string, employeeId: string) {
    const leave = await leaveRepository.findById(leaveId);
    if (!leave) throw new AppError('Leave request not found', 404);
    if (leave.employee_id !== employeeId) throw new AppError('Unauthorized', 403);
    if (leave.status !== 'pending') throw new AppError('Cannot cancel a processed leave request', 400);
    // FIX: previously passed `employeeId` as the `approved_by` column,
    // which records the employee as having "approved" their own
    // cancellation. A cancellation has no approver.
    return leaveRepository.updateStatus(leaveId, 'cancelled', null);
  },
};