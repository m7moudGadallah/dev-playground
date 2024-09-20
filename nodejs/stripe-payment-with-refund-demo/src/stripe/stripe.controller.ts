import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../common/utils';
import { StripeHookService, StripeService } from './services';
import { ConfigService } from '../config/services';
import Stripe from 'stripe';

export class StripeController {
  constructor(
    private readonly stripe: StripeService,
    private readonly config: ConfigService,
    private readonly stripeHook: StripeHookService,
  ) {}

  webhook = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const sig = req.headers['stripe-signature'];
      const endpointSecret = this.config.get('STRIPE_ENDPOINT_SECRET');

      let event;

      if (!sig) {
        res.status(401).json({
          status: 'fail',
          message: 'stripe signature not found',
        });
      } else {
        try {
          event = this.stripe.webhooks.constructEvent(
            req.body,
            sig,
            endpointSecret,
          );
        } catch (error) {
          res.status(400).json({
            status: 'fail',
            message: `Webhook Error: ${(error as Error).message}`,
          });
          return;
        }

        // Handle the event
        switch (event.type) {
          case 'checkout.session.completed':
            const session = event.data.object as Stripe.Checkout.Session;
            console.log({
              checkoutSessionId: session.id,
              orderId: session.metadata?.orderId,
              transactionId: session.payment_intent,
            });

            await this.stripeHook.confirmOrderCheckout({
              checkoutSessionId: session.id,
              orderId: session.metadata?.orderId as string,
              transactionId: session.payment_intent as string,
            });
            break;
          default:
            console.log(`Unhandled event type ${event.type}`);
        }

        // Return a 200 response to acknowledge receipt of the event
        res.status(200).json({ status: 'success' });
      }
    },
  );
}
