import Joi from 'joi';

export const workLogSchema = Joi.object({
  task_id: Joi.string().uuid().required(),
  worked_hours: Joi.number().min(0.5).max(24).required(),
  description: Joi.string().trim().min(1).max(2000).required(),
  log_date: Joi.date().max('now').required().messages({
    'date.max': 'Log date cannot be in the future',
  }),
});