import { Request, Response, NextFunction } from 'express';

export class GlobalLoggerMiddleware {
  private colorize(
    text: string,
    color: 'red' | 'green' | 'blue' | 'yellow',
  ): string {
    const colors = {
      red: '\x1b[31m',
      green: '\x1b[32m',
      blue: '\x1b[34m',
      yellow: '\x1b[33m',
    };

    return colors[color] + text + '\x1b[0m';
  }

  use = (req: Request, res: Response, next: NextFunction) => {
    const startTime = process.hrtime();

    res.on('finish', () => {
      const statusCode = res.statusCode;
      const color =
        statusCode >= 200 && statusCode < 300
          ? 'green'
          : statusCode >= 300 && statusCode < 400
            ? 'blue'
            : statusCode >= 400 && statusCode < 500
              ? 'yellow'
              : 'red';
      const diff = process.hrtime(startTime);
      const responseTimeMs = parseInt(
        (diff[0] * 1e3 + diff[1] / 1e6).toFixed(3),
      ); // Convert to ms
      console.log(
        `[${new Date().toISOString()}] ` +
          this.colorize(`${req.method} ${req.path} ${statusCode}`, color) +
          ` - ${responseTimeMs}ms`,
      );
    });
    next();
  };
}
