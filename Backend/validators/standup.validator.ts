import Joi from 'joi';

export const standupSchema = Joi.object({
  yesterday_work: Joi.string().trim().min(1).max(2000).required(),
  today_plan: Joi.string().trim().min(1).max(2000).required(),
  blockers: Joi.string().trim().max(2000).optional().allow(''),
  standup_date: Joi.date().max('now').required().messages({
    'date.max': 'Standup date cannot be in the future',
  }),
});