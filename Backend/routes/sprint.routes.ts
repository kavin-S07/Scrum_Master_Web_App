import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { sprintController } from '../controllers/sprint.controller';
import { sprintSchema, sprintUpdateSchema } from '../validators/sprint.validator';

const router = Router();

router.get('/:id', authenticate, sprintController.getById);
router.post('/', authenticate, authorize('admin', 'scrum_master'), validate(sprintSchema), sprintController.create);
router.put('/:id', authenticate, authorize('admin', 'scrum_master'), validate(sprintUpdateSchema), sprintController.update);
router.delete('/:id', authenticate, authorize('admin'), sprintController.delete);
router.get('/:id/burndown', authenticate, sprintController.getBurndown);

export default router;
