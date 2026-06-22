import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'admin' | 'scrum_master' | 'employee';
  employee_id: string;
}

/** An Express request after `authenticate` middleware has run. */
export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}