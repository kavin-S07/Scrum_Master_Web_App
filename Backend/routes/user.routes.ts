import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { userController } from '../controllers/user.controller';
import { userUpdateSchema, userRoleSchema } from '../validators/user.validator';

const router = Router();

router.get('/', authenticate, authorize('admin'), userController.getAll);
router.get('/:id', authenticate, userController.getById);
router.put('/:id', authenticate, validate(userUpdateSchema), userController.update);
router.patch('/:id/deactivate', authenticate, authorize('admin'), userController.deactivate);
router.patch('/:id/activate', authenticate, authorize('admin'), userController.activate);
router.patch('/:id/role', authenticate, authorize('admin'), validate(userRoleSchema), userController.updateRole);

export default router;
