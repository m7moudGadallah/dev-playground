import { Express } from 'express';
import { ConfigService } from '../../config/services';
import {
  GlobalExceptionHandlerMiddleware,
  UndefinedRoutesHandlerMiddleware,
} from '../middlewares';

export function postMiddlewareLoader(options: {
  app: Express;
  config: ConfigService;
}): void {
  const { app, config } = options;

  app.all('*', new UndefinedRoutesHandlerMiddleware().use);
  app.use(new GlobalExceptionHandlerMiddleware(config).use);
}
