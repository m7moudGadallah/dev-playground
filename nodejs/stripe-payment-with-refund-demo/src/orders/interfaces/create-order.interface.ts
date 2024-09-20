import { OrderItem } from './order-item.interface';

export interface CreateOrderInput {
  customerId: string;
  items: OrderItem[];
}

export interface CreateOrderOutput {
  orderId: string;
  checkoutSessionId: string;
  checkoutSessionUrl: string | null;
}
