import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';
import { env } from '../config/env';

interface PgError extends Error {
  code?: string;
  constraint?: string;
  detail?: string;
}

export const errorHandler = (
  err: Error | AppError | PgError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(`${req.method} ${req.path} - ${err.message}`, err);

  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // PostgreSQL error codes: https://www.postgresql.org/docs/current/errcodes-appendix.html
  const pgError = err as PgError;
  switch (pgError.code) {
    case '23505': // unique_violation
      res.status(409).json({ success: false, message: 'Duplicate entry: resource already exists' });
      return;
    case '23503': // foreign_key_violation
      res.status(400).json({ success: false, message: 'Referenced resource does not exist' });
      return;
    case '23502': // not_null_violation
      res.status(400).json({ success: false, message: 'A required field is missing' });
      return;
    case '23514': // check_violation
      res.status(400).json({ success: false, message: 'One or more fields violate a data constraint' });
      return;
    case '22P02': // invalid_text_representation (e.g. malformed UUID)
      res.status(400).json({ success: false, message: 'Invalid value supplied in request' });
      return;
    default:
      break;
  }

  res.status(500).json({
    success: false,
    message: env.isProduction ? 'Internal server error' : err.message,
  });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
};