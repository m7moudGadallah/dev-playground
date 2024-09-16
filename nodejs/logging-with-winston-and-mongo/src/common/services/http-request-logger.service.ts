import { LoggerService, LogOptions } from './logger.service';
import { Request, Response } from 'express';

export interface HttpRequestLogOptions {
  req: Request;
  res: Response;
  responseTimeMs: number;
}

export interface HttpRequestLogMeta {
  requestId: string | null;
  method: string;
  url: string;
  statusCode: number;
  responseTimeMs: number;
  userAgent?: string;
  ip?: string;
  error?: {
    message?: string;
    stack?: string;
  };
}

export class HttpRequestLoggerService extends LoggerService {
  logHttpRequest(options: HttpRequestLogOptions): void {
    const { req, res, responseTimeMs } = options;
    const { method, originalUrl } = req;
    const { statusCode } = res;
    const message = `${method} ${originalUrl} ${statusCode} - ${responseTimeMs}ms`;

    // Metadata for logging
    let logMeta: HttpRequestLogMeta = {
      requestId: req?.requestId ?? null,
      method,
      url: originalUrl,
      statusCode,
      responseTimeMs,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    };

    if (statusCode >= 400) {
      logMeta = {
        ...logMeta,
        error: {
          message: res?.error?.message,
          stack: res?.error?.stack,
        },
      };
    }

    const logOptions: LogOptions = {
      level: statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info',
      message,
      meta: logMeta,
    };

    this.log(logOptions);
  }
}
