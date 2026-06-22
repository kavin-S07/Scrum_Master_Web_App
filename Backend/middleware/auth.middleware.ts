import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import { sendError } from '../utils/response';
import { query } from '../config/database';
import { AuthRequest, AuthenticatedUser } from '../types/express';

interface AccessTokenPayload {
  id: string;
  email: string;
  role: string;
  employee_id: string;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'No token provided', 401);
      return;
    }

    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) {
      sendError(res, 'No token provided', 401);
      return;
    }

    const decoded = jwt.verify(token, jwtConfig.secret) as AccessTokenPayload;

    // Re-check role/active status against the DB on every request rather
    // than trusting the JWT claims. A short-lived access token can outlive
    // a role change or deactivation that happened seconds after it was
    // issued; this keeps permission checks accurate without requiring a
    // token-revocation list.
    const result = await query<{
      id: string;
      email: string;
      role: AuthenticatedUser['role'];
      employee_id: string;
      is_active: boolean;
    }>('SELECT id, email, role, employee_id, is_active FROM users WHERE id = $1', [decoded.id]);

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      sendError(res, 'User not found or deactivated', 401);
      return;
    }

    const user = result.rows[0];
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      employee_id: user.employee_id,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      sendError(res, 'Token expired', 401);
    } else if (error instanceof jwt.JsonWebTokenError) {
      sendError(res, 'Invalid token', 401);
    } else {
      // Pass unexpected errors (e.g. DB failures) to the global error handler
      next(error);
    }
  }
};

export const authorize = (...roles: AuthenticatedUser['role'][]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }
    if (!roles.includes(req.user.role)) {
      sendError(res, 'Forbidden: insufficient permissions', 403);
      return;
    }
    next();
  };
};