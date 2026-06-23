import { Request, Response } from 'express';
import { teamRepository } from '../repositories/team.repository';
import { sendSuccess } from '../utils/response';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../types/express';
import { asyncHandler } from '../utils/asyncHandler';

export const teamController = {
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const teams = await teamRepository.findAll(req.query.department_id as string, req.query.scrum_master_id as string);
    sendSuccess(res, teams);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const team = await teamRepository.findById(req.params.id);
    if (!team) throw new AppError('Team not found', 404);
    sendSuccess(res, team);
  }),

  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    const team = await teamRepository.create(req.body);
    sendSuccess(res, team, 'Team created', 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const team = await teamRepository.update(req.params.id, req.body);
    if (!team) throw new AppError('Team not found', 404);
    sendSuccess(res, team, 'Team updated');
  }),

  getMembers: asyncHandler(async (req: Request, res: Response) => {
    const members = await teamRepository.getMembers(req.params.id);
    sendSuccess(res, members);
  }),

  addMember: asyncHandler(async (req: Request, res: Response) => {
    await teamRepository.addMember(req.params.id, req.body.employee_id);
    sendSuccess(res, null, 'Member added to team', 201);
  }),

  removeMember: asyncHandler(async (req: Request, res: Response) => {
    await teamRepository.removeMember(req.params.id, req.params.employeeId);
    sendSuccess(res, null, 'Member removed from team');
  }),
};