import Joi from 'joi';

export const projectSchema = Joi.object({
  project_name: Joi.string().trim().min(2).max(200).required(),
  project_code: Joi.string().trim().uppercase().alphanum().min(2).max(50).required(),
  description: Joi.string().trim().max(2000).optional().allow(''),
  start_date: Joi.date().required(),
  end_date: Joi.date().min(Joi.ref('start_date')).required().messages({
    'date.min': 'End date must be on or after start date',
  }),
  status: Joi.string()
    .valid('planning', 'active', 'on_hold', 'completed', 'cancelled')
    .default('planning'),
});

// FIX: PUT /projects/:id previously had no validation at all.
export const projectUpdateSchema = Joi.object({
  project_name: Joi.string().trim().min(2).max(200),
  description: Joi.string().trim().max(2000).allow(''),
  start_date: Joi.date(),
  end_date: Joi.date(),
  status: Joi.string().valid('planning', 'active', 'on_hold', 'completed', 'cancelled'),
})
  .min(1)
  .custom((value, helpers) => {
    if (value.start_date && value.end_date && value.end_date < value.start_date) {
      return helpers.message({ custom: 'End date must be on or after start date' });
    }
    return value;
  });

export const assignTeamToProjectSchema = Joi.object({
  team_id: Joi.string().uuid().required(),
});