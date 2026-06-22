import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { notificationController } from '../controllers/notification.controller';

const router = Router();

router.get('/', authenticate, notificationController.getAll);
router.patch('/:id/read', authenticate, notificationController.markRead);
router.patch('/read-all', authenticate, notificationController.markAllRead);

export default router;
