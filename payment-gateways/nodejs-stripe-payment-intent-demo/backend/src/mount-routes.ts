import express, { Express, Request, Response } from 'express';
import { stripeClient } from './stripe-client';
import Stripe from 'stripe';

export function mountRoutes(app: Express) {
  app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
    });
  });

  app.post(
    '/create-payment-intent',
    async (req: Request<any, any, { amount: number }>, res: Response) => {
      try {
        const { amount } = req.body;

        const paymentIntent = await stripeClient.paymentIntents.create({
          amount: amount * 100,
          currency: 'usd',
        });

        console.log(
          '----------------------New Payment Intent created--------------------------------'
        );
        console.log(paymentIntent);
        console.log(
          '----------------------------------------------------------------------------------------'
        );

        res.status(200).json({
          status: 'success',
          data: {
            paymentIntent: {
              id: paymentIntent.id,
              clientSecret: paymentIntent.client_secret,
            },
          },
        });
      } catch (error) {
        console.error('Error: ', error);
        res.status(500).json({
          status: 'error',
          message: (error as Error).message,
          details: {
            error,
          },
        });
      }
    }
  );

  app.post(
    '/stripe-webhook',
    express.raw({ type: 'application/json' }),
    async (req: Request<any, any, Stripe.Event>, res: Response) => {
      try {
        const event = req.body;

        console.log(
          '----------------------Received Event from stripe webhook--------------------------------'
        );
        switch (event.type) {
          case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('PaymentIntent was successful!');
            console.log(paymentIntent);
            break;
          default:
            console.log(`Unhandled event: ${event.type}`);
            break;
        }
        console.log(
          '----------------------------------------------------------------------------------------'
        );
        res.status(204).json();
      } catch (error) {
        console.log('Error: ', error);
        res.status(400).json({
          status: 'error',
          message: (error as Error).message,
          details: {
            error,
          },
        });
      }
    }
  );
}
