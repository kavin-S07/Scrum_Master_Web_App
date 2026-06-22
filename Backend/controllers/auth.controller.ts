import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types/express';
import { asyncHandler } from '../utils/asyncHandler';

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.register(req.body);
    sendSuccess(res, user, 'User registered successfully', 201);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    sendSuccess(res, result, 'Login successful');
  }),

  refreshToken: asyncHandler(async (req: Request, res: Response) => {
    const { refresh_token } = req.body;
    const tokens = await authService.refreshToken(refresh_token);
    sendSuccess(res, tokens, 'Token refreshed');
  }),

  logout: asyncHandler(async (req: AuthRequest, res: Response) => {
    await authService.logout(req.user!.id);
    sendSuccess(res, null, 'Logged out successfully');
  }),

  getProfile: asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await authService.getProfile(req.user!.id);
    sendSuccess(res, user, 'Profile fetched');
  }),

  changePassword: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { current_password, new_password } = req.body;
    await authService.changePassword(req.user!.id, current_password, new_password);
    sendSuccess(res, null, 'Password changed successfully');
  }),
};