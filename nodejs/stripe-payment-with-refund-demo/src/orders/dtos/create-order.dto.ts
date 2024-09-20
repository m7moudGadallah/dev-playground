import { OrderItem } from '../interfaces';

export interface CreateOrderDto {
  customerId: string;
  items: OrderItem[];
}
