import { Request } from 'express';

export interface PaginationParams {
  page: number;
  limit: number;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/** Parses `page`/`limit` query params with sane defaults and an upper bound. */
export function parsePagination(req: Request, defaultLimit = DEFAULT_LIMIT): PaginationParams {
  const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(req.query.limit as string, 10) || defaultLimit, 1),
    MAX_LIMIT
  );
  return { page, limit };
}
