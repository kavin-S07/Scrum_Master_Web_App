import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { teamController } from '../controllers/team.controller';
import { teamSchema, teamUpdateSchema, addTeamMemberSchema } from '../validators/team.validator';

const router = Router();

router.get('/', authenticate, teamController.getAll);
router.get('/:id', authenticate, teamController.getById);
router.post('/', authenticate, authorize('admin'), validate(teamSchema), teamController.create);
router.put('/:id', authenticate, authorize('admin'), validate(teamUpdateSchema), teamController.update);
router.get('/:id/members', authenticate, teamController.getMembers);
router.post(
  '/:id/members',
  authenticate,
  authorize('admin', 'scrum_master'),
  validate(addTeamMemberSchema),
  teamController.addMember
);
router.delete('/:id/members/:employeeId', authenticate, authorize('admin', 'scrum_master'), teamController.removeMember);

export default router;