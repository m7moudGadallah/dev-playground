import { Router } from 'express';
import { CustomModule } from '../common/utils';
import { StripeController } from './stripe.controller';
import express from 'express';
import { StripeHookService, StripeService } from './services';
import { ConfigService } from '../config/services';

export class StripeModule extends CustomModule {
  private readonly controller: StripeController;
  constructor(options: {
    providers: {
      stripe: StripeService;
      config: ConfigService;
      stripeHook: StripeHookService;
    };
  }) {
    super({
      path: '/',
    });
    const { providers } = options;
    this.controller = new StripeController(
      providers.stripe,
      providers.config,
      providers.stripeHook,
    );
  }

  config(): Router {
    this.router.post(
      '/stripe-webhook',
      express.raw({ type: 'application/json' }),
      this.controller.webhook,
    );
    return this.router;
  }
}
