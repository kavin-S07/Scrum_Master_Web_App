import { Request, Response } from 'express';
import { taskRepository } from '../repositories/task.repository';
import { sendSuccess, sendPaginated } from '../utils/response';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../types/express';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination } from '../utils/pagination';

export const taskController = {
  getAll: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit } = parsePagination(req);
    // Employees can only see their own tasks.
    const employeeId = req.user!.role === 'employee'
      ? req.user!.id
      : (req.query.employee_id as string);
    const { rows, total } = await taskRepository.findAll({
      sprintId: req.query.sprint_id as string,
      projectId: req.query.project_id as string,
      employeeId,
      status: req.query.status as string,
      priority: req.query.priority as string,
      page,
      limit,
    });
    sendPaginated(res, rows, total, page, limit);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const task = await taskRepository.findById(req.params.id);
    if (!task) throw new AppError('Task not found', 404);
    sendSuccess(res, task);
  }),

  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    const task = await taskRepository.create({ ...req.body, created_by: req.user!.id });
    sendSuccess(res, task, 'Task created', 201);
  }),

  update: asyncHandler(async (req: AuthRequest, res: Response) => {
    // Employees may only update the status of tasks assigned to them.
    if (req.user!.role === 'employee') {
      const task = await taskRepository.findById(req.params.id);
      if (!task) throw new AppError('Task not found', 404);
      if (task.assigned_to_id !== req.user!.id) {
        throw new AppError('Forbidden: you can only update tasks assigned to you', 403);
      }
      const { status } = req.body;
      if (!status) throw new AppError('Only status updates are allowed for employees', 400);
      const updated = await taskRepository.update(req.params.id, { status });
      sendSuccess(res, updated, 'Task updated');
      return;
    }
    const task = await taskRepository.update(req.params.id, req.body);
    if (!task) throw new AppError('Task not found', 404);
    sendSuccess(res, task, 'Task updated');
  }),

  updateStatus: asyncHandler(async (req: AuthRequest, res: Response) => {
    const task = await taskRepository.findById(req.params.id);
    if (!task) throw new AppError('Task not found', 404);
    if (req.user!.role === 'employee') {
      if (task.assigned_to_id !== req.user!.id) {
        throw new AppError('Forbidden: you can only update status of tasks assigned to you', 403);
      }
    }
    const updated = await taskRepository.update(req.params.id, { status: req.body.status });
    sendSuccess(res, updated, 'Task status updated');
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await taskRepository.delete(req.params.id);
    sendSuccess(res, null, 'Task deleted');
  }),

  assignEmployee: asyncHandler(async (req: AuthRequest, res: Response) => {
    await taskRepository.assignEmployee(req.params.id, req.body.employee_id, req.user!.id);
    sendSuccess(res, null, 'Task assigned');
  }),

  getAssignmentHistory: asyncHandler(async (req: Request, res: Response) => {
    const history = await taskRepository.getAssignmentHistory(req.params.id);
    sendSuccess(res, history);
  }),
};