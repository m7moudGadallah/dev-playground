import express, { Request, Response } from 'express';
import morgan from 'morgan';
import { stripeClient } from './stripe-client';
import Stripe from 'stripe';

const PORT = Number(process.env?.PORT);
const NODE_ENV = process.env?.NODE_ENV;

const app = express();

// Parse Request body
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
  });
});

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

app.post(
  '/create-checkout-session',
  async (req: Request<any, any, { items: OrderItem[] }>, res: Response) => {
    try {
      const { items } = req.body;

      const session = await stripeClient.checkout.sessions.create({
        line_items: items.map((item) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
            },
            unit_amount: item.price * 100,
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: process.env?.CHECKOUT_SUCCESS_URL as string,
        cancel_url: process.env?.CHECKOUT_CANCEL_URL as string,
      });

      console.log(
        '----------------------New Checkout Session created--------------------------------'
      );
      console.log(session);
      console.log(
        '----------------------------------------------------------------------------------'
      );
      res.status(201).json({
        status: 'success',
        data: {
          session: {
            id: session.id,
            url: session.url,
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

app.get('/success', async (req: Request, res: Response) => {
  res.status(200).send('<h1>Checkout succeeded!</h1>');
});

app.get('/cancel', async (req: Request, res: Response) => {
  res.status(200).send('<h1>Checkout canceled!</h1>');
});

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
        case 'checkout.session.completed':
          const session = event.data.object;
          console.log(session);
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

if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.listen(PORT, async () => {
  console.log(`App is up and running in ${NODE_ENV} mode on port ${PORT}!`);
});
