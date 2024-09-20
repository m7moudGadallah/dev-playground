import { Request, Response, NextFunction } from 'express';
import { JsonResponse } from '../interfaces';

export type TAsyncHandler = (
  req: Request<any | never, any | never, any | never, any | never> | any,
  res: Response<JsonResponse | any, any | never>,
  next: NextFunction,
) => Promise<void>;

export function catchAsync(fn: TAsyncHandler): TAsyncHandler {
  return async function (req, res, next) {
    try {
      await Promise.resolve(fn(req, res, next));
    } catch (error) {
      next(error);
    }
  };
}
