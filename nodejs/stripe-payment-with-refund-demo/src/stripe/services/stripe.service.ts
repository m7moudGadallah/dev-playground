import Stripe from 'stripe';
import { ConfigService } from '../../config/services/config.service';

export class StripeService extends Stripe {
  constructor(config: ConfigService) {
    super(config.get('STRIPE_API_SECRET_KEY'));
  }
}
