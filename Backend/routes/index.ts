import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import departmentRoutes from './department.routes';
import teamRoutes from './team.routes';
import projectRoutes from './project.routes';
import sprintRoutes from './sprint.routes';
import taskRoutes from './task.routes';
import workLogRoutes from './worklog.routes';
import standupRoutes from './standup.routes';
import leaveRoutes from './leave.routes';
import notificationRoutes from './notification.routes';
import reassignmentRoutes from './reassignment.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/departments', departmentRoutes);
router.use('/teams', teamRoutes);
router.use('/projects', projectRoutes);
router.use('/sprints', sprintRoutes);
router.use('/tasks', taskRoutes);
router.use('/work-logs', workLogRoutes);
router.use('/standups', standupRoutes);
router.use('/leaves', leaveRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reassignments', reassignmentRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
