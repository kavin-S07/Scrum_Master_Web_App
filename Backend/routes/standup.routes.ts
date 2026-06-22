import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { standupController } from '../controllers/startup.controller';
import { standupSchema } from '../validators/standup.validator';

const router = Router();

router.post('/', authenticate, authorize('employee'), validate(standupSchema), standupController.submit);
router.get('/team/:teamId', authenticate, standupController.getByTeam);
router.get('/my', authenticate, standupController.getMyStandups);

export default router;
