import { Router } from 'express';
import { CustomModule } from '../common/utils';
import { CustomersService } from './services';
import { CustomersController } from './customers.controller';

export class CustomersModule extends CustomModule {
  private readonly controller;
  constructor(options: { providers: { customersService: CustomersService } }) {
    super({
      path: '/api/v1/customers',
    });
    const { providers } = options;

    this.controller = new CustomersController(providers.customersService);
  }

  config(): Router {
    this.router.get('/', this.controller.getCustomers);
    return this.router;
  }
}
