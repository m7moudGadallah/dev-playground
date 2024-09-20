type configKeyType =
  | 'NODE_ENV'
  | 'PORT'
  | 'MONGO_URI'
  | 'STRIPE_API_SECRET_KEY'
  | 'STRIPE_ENDPOINT_SECRET'
  | 'CHECKOUT_SESSION_SUCCESS_URL'
  | 'CHECKOUT_SESSION_CANCEL_URL';

export class ConfigService {
  constructor() {}

  get(key: configKeyType): string {
    if (!process.env?.[key]) {
      throw new Error(`Process env key [${key}] not found!`);
    }
    return process.env[key];
  }
}
