import { Router } from 'express';
import { CustomModule } from '../common/utils';
import { OrdersController } from './orders.controller';
import { OrdersService } from './services';
import { ValidatorMiddleware } from '../common/middlewares';
import { cancelOrderSchema, createOrderSchema } from './validation';

export class OrdersModule extends CustomModule {
  private readonly controller: OrdersController;
  private readonly validator: ValidatorMiddleware;

  constructor(options: {
    providers: { ordersService: OrdersService; validator: ValidatorMiddleware };
  }) {
    super({
      path: '/api/v1/orders',
    });
    const { providers } = options;
    this.controller = new OrdersController(providers.ordersService);
    this.validator = providers.validator;
  }

  config(): Router {
    this.router.post(
      '/',
      this.validator.validate(createOrderSchema),
      this.controller.createOrder,
    );

    this.router.post(
      '/cancel',
      this.validator.validate(cancelOrderSchema),
      this.controller.cancelOrder,
    );

    return this.router;
  }
}
