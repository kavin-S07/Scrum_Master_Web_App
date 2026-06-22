import { Request, Response } from 'express';
import { projectRepository } from '../repositories/project.repository';
import { sendSuccess, sendPaginated } from '../utils/response';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../types/express';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination } from '../utils/pagination';

export const projectController = {
  getAll: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit } = parsePagination(req);
    const { rows, total } = await projectRepository.findAll(page, limit, req.query.status as string);
    sendPaginated(res, rows, total, page, limit);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const project = await projectRepository.findById(req.params.id);
    if (!project) throw new AppError('Project not found', 404);
    sendSuccess(res, project);
  }),

  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = await projectRepository.create({ ...req.body, created_by: req.user!.id });
    sendSuccess(res, project, 'Project created', 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const project = await projectRepository.update(req.params.id, req.body);
    if (!project) throw new AppError('Project not found', 404);
    sendSuccess(res, project, 'Project updated');
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await projectRepository.delete(req.params.id);
    sendSuccess(res, null, 'Project deleted');
  }),

  assignTeam: asyncHandler(async (req: Request, res: Response) => {
    await projectRepository.assignTeam(req.params.id, req.body.team_id);
    sendSuccess(res, null, 'Team assigned to project', 201);
  }),

  removeTeam: asyncHandler(async (req: Request, res: Response) => {
    await projectRepository.removeTeam(req.params.id, req.params.teamId);
    sendSuccess(res, null, 'Team removed from project');
  }),

  getTeams: asyncHandler(async (req: Request, res: Response) => {
    const teams = await projectRepository.getProjectTeams(req.params.id);
    sendSuccess(res, teams);
  }),
};