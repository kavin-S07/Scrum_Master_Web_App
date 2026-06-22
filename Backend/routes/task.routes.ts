import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { taskController } from '../controllers/task.controller';
import { taskSchema, assignTaskSchema, updateTaskStatusSchema } from '../validators/task.validator';

const router = Router();

router.get('/', authenticate, taskController.getAll);
router.get('/:id', authenticate, taskController.getById);
router.post('/', authenticate, authorize('admin', 'scrum_master'), validate(taskSchema), taskController.create);
router.put('/:id', authenticate, taskController.update);
router.patch('/:id/status', authenticate, validate(updateTaskStatusSchema), taskController.updateStatus);
router.delete('/:id', authenticate, authorize('admin', 'scrum_master'), taskController.delete);
router.post('/:id/assign', authenticate, authorize('admin', 'scrum_master'), validate(assignTaskSchema), taskController.assignEmployee);
router.get('/:id/history', authenticate, taskController.getAssignmentHistory);

export default router;
