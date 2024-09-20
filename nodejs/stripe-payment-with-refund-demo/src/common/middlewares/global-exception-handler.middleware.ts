import { Request, Response, NextFunction } from 'express';
import { JsonResponse } from '../interfaces';
import { AppError } from '../utils';
import { ConfigService } from '../../config/services';

export class GlobalExceptionHandlerMiddleware {
  constructor(private readonly config: ConfigService) {}

  use = (
    error: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> | void => {
    let statusCode: number = 500;
    let responseBody: JsonResponse = {
      status: 'error',
      message: 'unexpected error happened',
    };

    if ((error as AppError)?.isOperational) {
      statusCode = (error as AppError).statusCode;
      responseBody = {
        status: (error as AppError).status,
        message: error.message,
      };
    }

    if (this.config.get('NODE_ENV') === 'development') {
      responseBody.details = {
        stack: error.stack,
      };
    }

    res.status(statusCode).json(responseBody);
  };
}
