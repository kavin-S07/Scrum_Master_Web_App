import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRouteHandler<Req extends Request = Request> = (
  req: Req,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

/**
 * Wraps an async Express handler so rejected promises are forwarded to
 * `next(err)` automatically. Every controller in this codebase previously
 * repeated the same `try { ... } catch (err) { next(err) }` block by hand —
 * that's easy to forget on a new method (an uncaught rejection would hang
 * the request) and adds noise to every single handler. This is the standard
 * way to handle async errors in Express 4 (Express 5 does this natively).
 */
export const asyncHandler = <Req extends Request = Request>(
  fn: AsyncRouteHandler<Req>
): RequestHandler => {
  return (req, res, next) => {
    fn(req as Req, res, next).catch(next);
  };
};