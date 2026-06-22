import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { departmentController } from '../controllers/department.controller';
import { departmentSchema, departmentUpdateSchema } from '../validators/department.validator';

const router = Router();

router.get('/', authenticate, departmentController.getAll);
router.get('/:id', authenticate, departmentController.getById);
router.post('/', authenticate, authorize('admin'), validate(departmentSchema), departmentController.create);
router.put('/:id', authenticate, authorize('admin'), validate(departmentUpdateSchema), departmentController.update);
router.delete('/:id', authenticate, authorize('admin'), departmentController.delete);

export default router;