type TEnvVar = 'NODE_ENV' | 'PORT' | 'MONGO_APP_DB_URL' | 'MONGO_LOG_DB_URL';

export class ConfigService {
  private static instance: ConfigService;

  private constructor() {}

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }

    return ConfigService.instance;
  }
  get(key: TEnvVar): string {
    if (!process.env[key]) {
      throw new Error(`Env variable [${key}] not found`);
    }
    return process.env[key];
  }
}
