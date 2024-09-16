import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export class RequestIdGeneratorMiddleware {
  generate = async (req: Request, res: Response, next: NextFunction) => {
    req.requestId = randomUUID();
    next();
  };
}
