import { Request, Response } from 'express';
import { sprintRepository } from '../repositories/sprint.repository';
import { sendSuccess } from '../utils/response';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../types/express';
import { asyncHandler } from '../utils/asyncHandler';

export const sprintController = {
  getByProject: asyncHandler(async (req: Request, res: Response) => {
    const sprints = await sprintRepository.findByProject(req.params.projectId);
    sendSuccess(res, sprints);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const sprint = await sprintRepository.findById(req.params.id);
    if (!sprint) throw new AppError('Sprint not found', 404);
    sendSuccess(res, sprint);
  }),

  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    const sprint = await sprintRepository.create({ ...req.body, created_by: req.user!.id });
    sendSuccess(res, sprint, 'Sprint created', 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const sprint = await sprintRepository.update(req.params.id, req.body);
    if (!sprint) throw new AppError('Sprint not found', 404);
    sendSuccess(res, sprint, 'Sprint updated');
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await sprintRepository.delete(req.params.id);
    sendSuccess(res, null, 'Sprint deleted');
  }),

  getBurndown: asyncHandler(async (req: Request, res: Response) => {
    const data = await sprintRepository.getBurndownData(req.params.id);
    if (!data) throw new AppError('Sprint not found', 404);
    sendSuccess(res, data, 'Burndown data fetched');
  }),
};