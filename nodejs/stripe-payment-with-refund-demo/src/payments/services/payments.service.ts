import {
  CreatePaymentInput,
  CreatePaymentOutput,
  GetPaymentsInput,
  GetPaymentsOutput,
  PaymentModel,
} from '../interfaces';

export interface PaymentsServiceOptions {
  models: {
    payment: PaymentModel;
  };
}

export class PaymentsService {
  private readonly models: PaymentsServiceOptions['models'];

  constructor(options: PaymentsServiceOptions) {
    const { models } = options;
    this.models = models;
  }

  async getPayments(
    getPaymentsInput: GetPaymentsInput,
  ): Promise<GetPaymentsOutput> {
    const { filter } = getPaymentsInput;

    const payments = await this.models.payment.find(filter);
    return { payments };
  }

  async createPayment(
    createPaymentInput: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    const payment = await this.models.payment.create(createPaymentInput);
    return { payment };
  }
}
