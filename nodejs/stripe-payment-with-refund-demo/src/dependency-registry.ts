import { ConfigService } from './config/services/config.service';
import { MongooseService } from './mongoose/services';
import { StripeService } from './stripe/services/stripe.service';

export * from './customers/customer.model';
import { customerModel } from './customers/customer.model';
import { CustomersService } from './customers/services';

export * from './books/book.model';
import { bookModel } from './books/book.model';
import { BooksService } from './books/services';

export * from './orders/order.model';
import { orderModel } from './orders/order.model';
import { OrdersService } from './orders/services';

export * from './payments/payments.model';
import { paymentModel } from './dependency-registry';
import { PaymentsService } from './payments/services';

export * from './refunds/refund.model';
import { refundModel } from './refunds/refund.model';

import { ValidatorMiddleware } from './common/middlewares';
import { StripeHookService } from './stripe/services';

// Middlewares
export const validatorMiddleware: ValidatorMiddleware =
  new ValidatorMiddleware();

// Config Module
export const configService: ConfigService = new ConfigService();

// Mongoose Module
export const mongooseService: MongooseService = new MongooseService(
  configService,
);

// Payment Module
export const paymentService: PaymentsService = new PaymentsService({
  models: {
    payment: paymentModel,
  },
});

// Stripe Module
export const stripeService: StripeService = new StripeService(configService);

// Customers Module
export const customersService: CustomersService = new CustomersService({
  models: {
    customer: customerModel,
  },
});

// Books Module
export const booksService: BooksService = new BooksService({
  models: {
    book: bookModel,
  },
});

// Orders Module
export const ordersService: OrdersService = new OrdersService({
  services: {
    stripe: stripeService,
    config: configService,
    payments: paymentService,
    customers: customersService,
  },
  models: {
    book: bookModel,
    order: orderModel,
    refund: refundModel,
  },
});

export const stripeHookService: StripeHookService = new StripeHookService({
  services: {
    orders: ordersService,
    payments: paymentService,
  },
});
