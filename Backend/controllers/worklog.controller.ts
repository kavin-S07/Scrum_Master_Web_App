import { Request, Response } from 'express';
import { workLogRepository } from '../repositories/worklog.repository';
import { sendSuccess } from '../utils/response';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../types/express';
import { asyncHandler } from '../utils/asyncHandler';

export const workLogController = {
  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    const log = await workLogRepository.create({ ...req.body, employee_id: req.user!.id });
    sendSuccess(res, log, 'Work log created', 201);
  }),

  getByTask: asyncHandler(async (req: Request, res: Response) => {
    const logs = await workLogRepository.findByTask(req.params.taskId);
    sendSuccess(res, logs);
  }),

  getByEmployee: asyncHandler(async (req: AuthRequest, res: Response) => {
    // Non-admins/SMs can only view their own logs.
    const requestedId = req.params.employeeId || req.user!.id;
    if (req.user!.role === 'employee' && requestedId !== req.user!.id) {
      throw new AppError('Forbidden: you can only view your own work logs', 403);
    }
    const logs = await workLogRepository.findByEmployee(
      requestedId,
      req.query.start_date ? new Date(req.query.start_date as string) : undefined,
      req.query.end_date ? new Date(req.query.end_date as string) : undefined
    );
    sendSuccess(res, logs);
  }),
};