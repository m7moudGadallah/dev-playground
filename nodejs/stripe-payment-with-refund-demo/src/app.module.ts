import { Router } from 'express';
import { CustomModule } from './common/utils';
import { GeneralModule } from './general/general.module';
import { BooksModule } from './books/books.module';
import {
  booksService,
  configService,
  customersService,
  stripeService,
  ordersService,
  validatorMiddleware,
  stripeHookService,
} from './dependency-registry';
import { CustomersModule } from './customers/customers.module';
import { StripeModule } from './stripe/stripe.module';
import { OrdersModule } from './orders/orders.module';

export class AppModule extends CustomModule {
  constructor() {
    super({
      path: '/',
    });
  }

  private getSubmodulesInfo(): CustomModule[] {
    return [
      new CustomersModule({
        providers: {
          customersService,
        },
      }),
      new BooksModule({
        providers: {
          booksService,
        },
      }),
      new OrdersModule({
        providers: {
          ordersService,
          validator: validatorMiddleware,
        },
      }),
    ];
  }

  config(): Router {
    const generalModule = new GeneralModule();
    const stripeModule = new StripeModule({
      providers: {
        stripe: stripeService,
        config: configService,
        stripeHook: stripeHookService,
      },
    });
    this.router.use(stripeModule.prefix, stripeModule.config());

    this.getSubmodulesInfo().forEach((module) => {
      this.router.use(module.prefix, module.config());
    });

    this.router.use(generalModule.prefix, generalModule.config());

    return this.router;
  }
}
