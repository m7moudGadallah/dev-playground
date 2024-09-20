import { Types } from 'mongoose';

export interface OrderItem {
  bookId: Types.ObjectId;
  quantity: number;
}
