import Joi from 'joi';

export const sprintSchema = Joi.object({
  project_id: Joi.string().uuid().required(),
  sprint_name: Joi.string().trim().min(2).max(100).required(),
  goal: Joi.string().trim().max(1000).optional().allow(''),
  start_date: Joi.date().required(),
  end_date: Joi.date().min(Joi.ref('start_date')).required().messages({
    'date.min': 'End date must be on or after start date',
  }),
  sprint_status: Joi.string()
    .valid('planned', 'active', 'completed', 'cancelled')
    .default('planned'),
});

// FIX: PUT /sprints/:id previously had no validation at all.
export const sprintUpdateSchema = Joi.object({
  sprint_name: Joi.string().trim().min(2).max(100),
  goal: Joi.string().trim().max(1000).allow(''),
  start_date: Joi.date(),
  end_date: Joi.date(),
  sprint_status: Joi.string().valid('planned', 'active', 'completed', 'cancelled'),
})
  .min(1)
  .custom((value, helpers) => {
    if (value.start_date && value.end_date && value.end_date < value.start_date) {
      return helpers.message({ custom: 'End date must be on or after start date' });
    }
    return value;
  });