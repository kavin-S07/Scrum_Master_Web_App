import Joi from 'joi';

const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[A-Z])(?=.*\d)/)
  .required()
  .messages({
    'string.pattern.base': 'Password must contain at least one uppercase letter and one number',
  });

export const registerSchema = Joi.object({
  first_name: Joi.string().trim().min(2).max(100).required(),
  last_name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim().required(),
  password: passwordSchema,
  phone: Joi.string().trim().max(20).optional().allow(''),
  role: Joi.string().valid('employee', 'scrum_master').default('employee'),
});

export const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim().required(),
  password: Joi.string().required(),
});

export const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string().required(),
});

export const changePasswordSchema = Joi.object({
  current_password: Joi.string().required(),
  new_password: passwordSchema,
});