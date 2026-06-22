import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { workLogController } from '../controllers/worklog.controller';
import { workLogSchema } from '../validators/workLog.validator';

const router = Router();

router.post('/', authenticate, authorize('employee'), validate(workLogSchema), workLogController.create);
router.get('/task/:taskId', authenticate, workLogController.getByTask);
router.get('/employee/:employeeId', authenticate, workLogController.getByEmployee);
router.get('/my', authenticate, workLogController.getByEmployee);

export default router;
