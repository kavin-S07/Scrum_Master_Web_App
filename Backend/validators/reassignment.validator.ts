import Joi from 'joi';

// FIX: POST /reassignments had no validation at all — task_id/new_employee_id
// went straight from req.body into service calls and SQL inserts.
export const manualReassignSchema = Joi.object({
  task_id: Joi.string().uuid().required(),
  new_employee_id: Joi.string().uuid().required(),
  reason: Joi.string().trim().min(3).max(500).required(),
});