import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { reassignmentController } from '../controllers/reassignment.controller';
import { manualReassignSchema } from '../validators/reassignment.validator';

const router = Router();

router.post('/', authenticate, authorize('admin', 'scrum_master'), validate(manualReassignSchema), reassignmentController.manualReassign);
router.get('/', authenticate, reassignmentController.getHistory);

export default router;
