import { OrdersService } from '../../orders/services';
import { PaymentsService } from '../../payments/services';
import {
  CompleteOrderCheckoutInput,
  CompleteOrderCheckoutOutput,
} from '../interfaces';

export interface StripeHookServiceOptions {
  services: {
    orders: OrdersService;
    payments: PaymentsService;
  };
}

export class StripeHookService {
  private readonly services: StripeHookServiceOptions['services'];

  constructor(options: StripeHookServiceOptions) {
    const { services } = options;

    this.services = services;
  }

  async confirmOrderCheckout(
    completeOrderInput: CompleteOrderCheckoutInput,
  ): Promise<CompleteOrderCheckoutOutput> {
    const { payments } = await this.services.payments.getPayments({
      filter: { checkoutSessionId: completeOrderInput.checkoutSessionId },
    });

    const { order } = await this.services.orders.updateOrder({
      orderId: completeOrderInput.orderId,
      data: {
        status: 'completed',
      },
    });

    const { payment } = await this.services.payments.createPayment({
      orderId: payments[0].orderId as unknown as string,
      checkoutSessionId: completeOrderInput.checkoutSessionId,
      transactionId: completeOrderInput.transactionId,
      amount: payments[0].amount,
      status: 'completed',
      paymentMethod: payments[0].paymentMethod,
    });

    return {
      payment,
      order,
    };
  }
}
