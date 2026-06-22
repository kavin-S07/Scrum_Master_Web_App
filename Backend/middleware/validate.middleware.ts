import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { sendError } from '../utils/response';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Validates `req[target]` against a Joi schema. Defaults to `body` (the
 * original behavior) but can also validate route params (e.g. confirming
 * an `:id` is actually a UUID before it reaches the database, turning a
 * Postgres 22P02 error into a clean 400 earlier in the pipeline).
 */
export const validate = (schema: Joi.ObjectSchema, target: ValidationTarget = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[target], { abortEarly: false, stripUnknown: true });
    if (error) {
      const errors = error.details.map((d) => d.message);
      sendError(res, 'Validation failed', 400, errors);
      return;
    }
    req[target] = value;
    next();
  };
};

/** Builds a Joi schema asserting that the given route params are valid UUIDs. */
export const uuidParamsSchema = (...paramNames: string[]) => {
  const shape: Record<string, Joi.StringSchema> = {};
  for (const name of paramNames.length > 0 ? paramNames : ['id']) {
    shape[name] = Joi.string().uuid().required();
  }
  return Joi.object(shape).unknown(true);
};