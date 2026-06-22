import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { dashboardController } from '../controllers/dashboard.controller';

const router = Router();

router.get('/admin', authenticate, authorize('admin'), dashboardController.admin);
router.get('/scrum-master', authenticate, authorize('scrum_master'), dashboardController.scrumMaster);
router.get('/employee', authenticate, authorize('employee'), dashboardController.employee);
router.get('/team/:teamId/productivity', authenticate, authorize('admin', 'scrum_master'), dashboardController.teamProductivity);

export default router;
