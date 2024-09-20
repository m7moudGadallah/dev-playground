import mongoose from 'mongoose';
import { Order, OrderItem } from './interfaces';

const orderItemSchema = new mongoose.Schema<OrderItem>({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  quantity: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema<Order>({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'completed', 'canceled'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const orderModel = mongoose.model<Order>('Order', orderSchema);
