import { Request, Response } from 'express';
import { reassignmentService } from '../services/reassignment.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types/express';
import { asyncHandler } from '../utils/asyncHandler';

export const reassignmentController = {
  manualReassign: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { task_id, new_employee_id, reason } = req.body;
    const result = await reassignmentService.manualReassign(task_id, new_employee_id, reason, req.user!.id);
    sendSuccess(res, result, 'Task reassigned');
  }),

  getHistory: asyncHandler(async (req: Request, res: Response) => {
    const history = await reassignmentService.getReassignmentHistory(
      req.query.task_id as string,
      req.query.employee_id as string
    );
    sendSuccess(res, history);
  }),
};