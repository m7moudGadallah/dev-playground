import mongoose from 'mongoose';
import { Refund } from './interfaces';

const refundSchema = new mongoose.Schema<Refund>({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true,
  },
  transactionId: { type: String, required: true }, // Unique identifier from Stripe
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  refundDate: { type: Date, default: Date.now },
});

export const refundModel = mongoose.model<Refund>('Refund', refundSchema);
