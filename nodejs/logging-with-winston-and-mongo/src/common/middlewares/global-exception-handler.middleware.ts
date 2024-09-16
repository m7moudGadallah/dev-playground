import { Request, Response, NextFunction } from 'express';

export class GlobalExceptionHandlerMiddleware {
  constructor() {}

  handle = async (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    // this.logger.log({
    //   level: 'error',
    //   message: error.message,
    //   meta: {
    //     requestId: req.requestId ?? null,
    //     stack: error.stack,
    //   },
    // });

    res.error = error;

    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  };
}
