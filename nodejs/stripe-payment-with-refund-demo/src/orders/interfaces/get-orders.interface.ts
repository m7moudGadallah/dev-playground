import { FilterQuery } from 'mongoose';
import { Order } from './order.interface';

export interface GetOrdersInput {
  filter: FilterQuery<Order>;
}

export interface GetOrdersOutput {
  orders: Order[];
}
