import { Request, Response, NextFunction } from 'express';
import { Middleware } from '../interfaces';
import { AppError } from '../utils';

export class UndefinedRoutesHandlerMiddleware implements Middleware {
  use(req: Request, res: Response, next: NextFunction): void {
    next(new AppError(404, `can't find ${req.originalUrl} on this server`));
  }
}
