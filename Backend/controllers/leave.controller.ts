import { Response } from 'express';
import { leaveService } from '../services/leave.service';
import { sendSuccess, sendPaginated } from '../utils/response';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../types/express';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination } from '../utils/pagination';

export const leaveController = {
  request: asyncHandler(async (req: AuthRequest, res: Response) => {
    const leave = await leaveService.requestLeave(req.user!.id, req.body);
    sendSuccess(res, leave, 'Leave request submitted', 201);
  }),

  getAll: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit } = parsePagination(req);
    const employeeId = req.user!.role === 'employee'
      ? req.user!.id
      : (req.query.employee_id as string);
    const { rows, total } = await leaveService.getLeaves({
      status: req.query.status as string,
      employeeId,
      page,
      limit,
    });
    sendPaginated(res, rows, total, page, limit);
  }),

  getById: asyncHandler(async (req: AuthRequest, res: Response) => {
    const leave = await leaveService.getLeaveById(req.params.id);
    if (req.user!.role === 'employee' && leave.employee_id !== req.user!.id) {
      throw new AppError('Forbidden', 403);
    }
    sendSuccess(res, leave);
  }),

  approve: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status } = req.body;
    const leave = await leaveService.approveOrReject(req.params.id, status, req.user!.id);
    sendSuccess(res, leave, `Leave ${status}`);
  }),

  cancel: asyncHandler(async (req: AuthRequest, res: Response) => {
    await leaveService.cancelLeave(req.params.id, req.user!.id);
    sendSuccess(res, null, 'Leave request cancelled');
  }),
};