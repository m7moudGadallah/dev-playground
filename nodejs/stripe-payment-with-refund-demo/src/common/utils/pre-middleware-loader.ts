import express, { Express, Request, Response, NextFunction } from 'express';
import { GlobalLoggerMiddleware } from '../middlewares';

export function preMiddlewareLoader(options: { app: Express }): void {
  const { app } = options;

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/stripe-webhook') {
      // Skip express.json() for the Stripe webhook route
      next();
    } else {
      // Apply express.json() for all other routes
      express.json()(req, res, next);
    }
  });

  app.use(new GlobalLoggerMiddleware().use);
}
