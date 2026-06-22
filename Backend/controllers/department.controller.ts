import { Request, Response } from 'express';
import { departmentRepository } from '../repositories/department.repository';
import { sendSuccess } from '../utils/response';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';

export const departmentController = {
  getAll: asyncHandler(async (_req: Request, res: Response) => {
    const departments = await departmentRepository.findAll();
    sendSuccess(res, departments);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const dept = await departmentRepository.findById(req.params.id);
    if (!dept) throw new AppError('Department not found', 404);
    sendSuccess(res, dept);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const dept = await departmentRepository.create(req.body.name, req.body.description);
    sendSuccess(res, dept, 'Department created', 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const dept = await departmentRepository.update(req.params.id, req.body);
    if (!dept) throw new AppError('Department not found', 404);
    sendSuccess(res, dept, 'Department updated');
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await departmentRepository.delete(req.params.id);
    sendSuccess(res, null, 'Department deleted');
  }),
};