import {
  CustomerModel,
  GetCustomersInput,
  GetCustomersOutput,
} from '../interfaces';

interface CustomersServiceOptions {
  models: {
    customer: CustomerModel;
  };
}

export class CustomersService {
  private readonly models: CustomersServiceOptions['models'];

  constructor(options: CustomersServiceOptions) {
    const { models } = options;
    this.models = models;
  }

  async getCustomers(
    getCustomersInput: GetCustomersInput,
  ): Promise<GetCustomersOutput> {
    const customers = await this.models.customer.find().select({
      __v: false,
    });

    return {
      customers,
    };
  }
}
