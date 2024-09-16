import { createLogger, format, Logger, transports } from 'winston';
import { MongoDB, MongoDBTransportInstance } from 'winston-mongodb';
import { ConfigService } from './config.service';

export interface LogOptions {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  meta?: Record<string, any>;
}

export class LoggerService {
  private logger: Logger;

  constructor(config: ConfigService) {
    const mongoDBTransport: MongoDBTransportInstance = new MongoDB({
      db: config.get('MONGO_LOG_DB_URL'),
      collection: 'AppLogs',
      tryReconnect: true,
      options: {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      },
      metaKey: 'meta',
      format: format.combine(format.timestamp(), format.json()),
    });

    const consoleTransport = new transports.Console({
      format: format.combine(
        format.timestamp(),
        format.combine(),
        format.colorize(),
        format.simple(),
        format.printf(({ level, message, timestamp }) => {
          return `[${timestamp}] ${level}: ${message}`;
        }),
      ),
    });

    this.logger = createLogger({
      transports: [mongoDBTransport, consoleTransport],
    });
  }

  log(options: LogOptions): void {
    this.logger.log(options);
  }
}
