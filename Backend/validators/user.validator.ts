import Joi from 'joi';

export const userUpdateSchema = Joi.object({
  first_name: Joi.string().trim().min(2).max(100),
  last_name: Joi.string().trim().min(2).max(100),
  phone: Joi.string().trim().max(20).allow(''),
  profile_image: Joi.string().uri().max(2000).allow(''),
}).min(1);

export const userRoleSchema = Joi.object({
  role: Joi.string().valid('admin', 'scrum_master', 'employee').required(),
});