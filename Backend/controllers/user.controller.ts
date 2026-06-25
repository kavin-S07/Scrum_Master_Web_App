import { Response } from 'express';
import { userRepository } from '../repositories/user.repository';
import { authRepository } from '../repositories/auth.repository';
import { sendSuccess, sendPaginated } from '../utils/response';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../types/express';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination } from '../utils/pagination';

export const userController = {
  getAll: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit } = parsePagination(req);
    const role = req.query.role as string | undefined;
    const { rows, total } = await userRepository.findAll(page, limit, role);
    sendPaginated(res, rows, total, page, limit);
  }),

  getById: asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await userRepository.findById(req.params.id);
    if (!user) throw new AppError('User not found', 404);
    sendSuccess(res, user);
  }),

  update: asyncHandler(async (req: AuthRequest, res: Response) => {
    // Non-admins may only update their own profile.
    if (req.user!.role !== 'admin' && req.params.id !== req.user!.id) {
      throw new AppError('Forbidden: you can only update your own profile', 403);
    }
    // req.body has already been validated/whitelisted to first_name,
    // phone, profile_image by userUpdateSchema. The repository
    // layer also enforces its own column allow-list as defense in depth.
    const user = await userRepository.update(req.params.id, req.body);
    sendSuccess(res, user, 'User updated');
  }),

  /** Admin-only: promote/demote a user's role. Replaces the old (insecure)
   *  pattern of letting clients pick their own role at registration time. */
  updateRole: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.params.id === req.user!.id) {
      throw new AppError('You cannot change your own role', 400);
    }
    const target = await authRepository.findById(req.params.id);
    if (!target) throw new AppError('User not found', 404);
    const user = await authRepository.updateRole(req.params.id, req.body.role);
    sendSuccess(res, user, 'User role updated');
  }),

  deactivate: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.params.id === req.user!.id) throw new AppError('You cannot deactivate yourself', 400);
    await userRepository.deactivate(req.params.id);
    sendSuccess(res, null, 'User deactivated');
  }),

  activate: asyncHandler(async (req: AuthRequest, res: Response) => {
    await userRepository.activate(req.params.id);
    sendSuccess(res, null, 'User activated');
  }),
};