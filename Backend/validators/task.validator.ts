import Joi from 'joi';

export const taskSchema = Joi.object({
  sprint_id: Joi.string().uuid().optional().allow(null),
  project_id: Joi.string().uuid().required(),
  title: Joi.string().trim().min(2).max(250).required(),
  description: Joi.string().trim().max(5000).optional().allow(''),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
  status: Joi.string()
    .valid('todo', 'in_progress', 'testing', 'completed', 'blocked')
    .default('todo'),
  story_points: Joi.number().integer().min(1).max(100).optional().allow(null),
  due_date: Joi.date().optional().allow(null),
});

// FIX: PUT /tasks/:id had no validation for admin/scrum_master requests
// (only the employee-only status-only path was guarded in the controller).
export const taskUpdateSchema = Joi.object({
  sprint_id: Joi.string().uuid().allow(null),
  title: Joi.string().trim().min(2).max(250),
  description: Joi.string().trim().max(5000).allow(''),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical'),
  status: Joi.string().valid('todo', 'in_progress', 'testing', 'completed', 'blocked'),
  story_points: Joi.number().integer().min(1).max(100).allow(null),
  due_date: Joi.date().allow(null),
}).min(1);

export const assignTaskSchema = Joi.object({
  employee_id: Joi.string().uuid().required(),
});

/** Used for the restricted employee self-update path (status only). */
export const updateTaskStatusSchema = Joi.object({
  status: Joi.string()
    .valid('todo', 'in_progress', 'testing', 'completed', 'blocked')
    .required(),
});