import { Request, Response, NextFunction } from 'express';

export interface Middleware {
  use(req: Request, res: Response, next: NextFunction): Promise<void> | void;
}
