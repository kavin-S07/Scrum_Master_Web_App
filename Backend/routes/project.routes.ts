import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { projectController } from '../controllers/project.controller';
import { sprintController } from '../controllers/sprint.controller';
import {
  projectSchema,
  projectUpdateSchema,
  assignTeamToProjectSchema,
} from '../validators/project.validator';

const router = Router();

router.get('/', authenticate, projectController.getAll);
router.get('/:id', authenticate, projectController.getById);
router.post('/', authenticate, authorize('admin'), validate(projectSchema), projectController.create);
router.put('/:id', authenticate, authorize('admin'), validate(projectUpdateSchema), projectController.update);
router.delete('/:id', authenticate, authorize('admin'), projectController.delete);
router.post(
  '/:id/teams',
  authenticate,
  authorize('admin'),
  validate(assignTeamToProjectSchema),
  projectController.assignTeam
);
router.delete('/:id/teams/:teamId', authenticate, authorize('admin'), projectController.removeTeam);
router.get('/:id/teams', authenticate, projectController.getTeams);

// Nested under /projects to preserve the original URL shape — sprints
// still live in sprint.routes.ts for everything else (/sprints/:id, etc).
router.get('/:projectId/sprints', authenticate, sprintController.getByProject);

export default router;