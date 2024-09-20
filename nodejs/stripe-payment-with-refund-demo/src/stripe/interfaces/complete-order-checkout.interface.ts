import { Order } from '../../orders/interfaces';
import { Payment } from '../../payments/interfaces';

export interface CompleteOrderCheckoutInput {
  orderId: string;
  checkoutSessionId: string;
  transactionId: string;
}

export interface CompleteOrderCheckoutOutput {
  payment: Payment;
  order: Order;
}
