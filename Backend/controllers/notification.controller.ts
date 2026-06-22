import { Response } from 'express';
import { notificationRepository } from '../repositories/notification.repository';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types/express';
import { asyncHandler } from '../utils/asyncHandler';

export const notificationController = {
  getAll: asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const { rows, total, unread } = await notificationRepository.findByUser(req.user!.id, page);
    sendSuccess(res, { notifications: rows, total, unread });
  }),

  markRead: asyncHandler(async (req: AuthRequest, res: Response) => {
    await notificationRepository.markRead(req.params.id, req.user!.id);
    sendSuccess(res, null, 'Notification marked as read');
  }),

  markAllRead: asyncHandler(async (req: AuthRequest, res: Response) => {
    await notificationRepository.markAllRead(req.user!.id);
    sendSuccess(res, null, 'All notifications marked as read');
  }),
};