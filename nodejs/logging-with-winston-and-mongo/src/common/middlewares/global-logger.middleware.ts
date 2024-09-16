import { Request, Response, NextFunction } from 'express';
import { HttpRequestLoggerService } from '../services';

export class GlobalLoggerMiddleware {
  constructor(private readonly httpRequestLogger: HttpRequestLoggerService) {}

  log = async (req: Request, res: Response, next: NextFunction) => {
    const startTime = process.hrtime();

    res.on('finish', () => {
      const diff = process.hrtime(startTime);
      const responseTimeMs = parseInt(
        (diff[0] * 1e3 + diff[1] / 1e6).toFixed(3),
      ); // Convert to ms
      this.httpRequestLogger.logHttpRequest({
        req,
        res,
        responseTimeMs,
      });
    });

    next();
  };
}
