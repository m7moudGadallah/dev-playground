import { Payment } from './payment.interface';

export interface CreatePaymentInput {
  orderId: string;
  amount: number;
  checkoutSessionId: string;
  transactionId: string | null; // Stripe Transaction ID or Payment Intent ID
  status: Payment['status'];
  paymentMethod: string;
}

export interface CreatePaymentOutput {
  payment: Payment;
}
