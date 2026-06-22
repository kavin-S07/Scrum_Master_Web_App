import { Request, Response } from 'express';
import { standupRepository } from '../repositories/standup.repository';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types/express';
import { asyncHandler } from '../utils/asyncHandler';

export const standupController = {
  submit: asyncHandler(async (req: AuthRequest, res: Response) => {
    const standup = await standupRepository.create({ ...req.body, employee_id: req.user!.id });
    sendSuccess(res, standup, 'Standup submitted', 201);
  }),

  getByTeam: asyncHandler(async (req: Request, res: Response) => {
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const standups = await standupRepository.findByTeamAndDate(req.params.teamId, date);
    sendSuccess(res, standups);
  }),

  getMyStandups: asyncHandler(async (req: AuthRequest, res: Response) => {
    const standups = await standupRepository.findByEmployee(req.user!.id);
    sendSuccess(res, standups);
  }),
};