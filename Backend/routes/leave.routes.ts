import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { leaveController } from '../controllers/leave.controller';
import { leaveRequestSchema, leaveApprovalSchema } from '../validators/leave.validator';

const router = Router();

router.post('/', authenticate, validate(leaveRequestSchema), leaveController.request);
router.get('/', authenticate, leaveController.getAll);
router.get('/:id', authenticate, leaveController.getById);
router.patch('/:id/decision', authenticate, authorize('admin', 'scrum_master'), validate(leaveApprovalSchema), leaveController.approve);
router.patch('/:id/cancel', authenticate, leaveController.cancel);

export default router;
