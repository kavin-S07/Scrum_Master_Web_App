import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types/express';
import { asyncHandler } from '../utils/asyncHandler';

export const dashboardController = {
  admin: asyncHandler(async (_req: Request, res: Response) => {
    const data = await dashboardService.getAdminDashboard();
    sendSuccess(res, data);
  }),

  scrumMaster: asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await dashboardService.getScrumMasterDashboard(req.user!.id);
    sendSuccess(res, data);
  }),

  employee: asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await dashboardService.getEmployeeDashboard(req.user!.id);
    sendSuccess(res, data);
  }),

  teamProductivity: asyncHandler(async (req: Request, res: Response) => {
    const data = await dashboardService.getTeamProductivity(req.params.teamId);
    sendSuccess(res, data);
  }),
};