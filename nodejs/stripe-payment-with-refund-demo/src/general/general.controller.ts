import { Request, Response, NextFunction } from 'express';

export class GeneralController {
  ping(req: Request, res: Response, next: NextFunction) {
    res.status(200).json({
      status: 'success',
    });
  }
}
