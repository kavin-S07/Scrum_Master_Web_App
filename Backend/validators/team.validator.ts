import Joi from 'joi';

export const teamSchema = Joi.object({
  department_id: Joi.string().uuid().required(),
  team_name: Joi.string().trim().min(2).max(100).required(),
  scrum_master_id: Joi.string().uuid().required(),
});

// FIX: PUT /teams/:id previously had no validation at all, so the
// repository's dynamic SET-clause builder was being fed raw, unvalidated
// req.body. This schema closes that gap.
export const teamUpdateSchema = Joi.object({
  department_id: Joi.string().uuid(),
  team_name: Joi.string().trim().min(2).max(100),
  scrum_master_id: Joi.string().uuid(),
}).min(1);

export const addTeamMemberSchema = Joi.object({
  employee_id: Joi.string().uuid().required(),
});