import { Document, Model, Types } from 'mongoose';
import { OrderItem } from './order-item.interface';

export interface Order extends Document {
  customerId: Types.ObjectId;
  items: OrderItem[];
  status: 'pending' | 'completed' | 'canceled';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderModel extends Model<Order> {}
