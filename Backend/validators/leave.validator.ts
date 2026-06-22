import Joi from 'joi';

export const leaveRequestSchema = Joi.object({
  leave_type: Joi.string()
    .valid('medical', 'casual', 'annual', 'emergency', 'unpaid')
    .required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().min(Joi.ref('start_date')).required().messages({
    'date.min': 'End date must be on or after start date',
  }),
  reason: Joi.string().trim().min(10).max(1000).required(),
});

export const leaveApprovalSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required(),
  remarks: Joi.string().trim().max(500).optional().allow(''),
});