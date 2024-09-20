import { Order } from './order.interface';

export interface UpdateOrderInput {
  orderId: string;
  data: {
    status?: Order['status'];
  };
}

export interface UpdateOrderOutput {
  order: Order;
}
