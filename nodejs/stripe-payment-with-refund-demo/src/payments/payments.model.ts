import mongoose from 'mongoose';
import { Payment } from './interfaces';

const paymentSchema = new mongoose.Schema<Payment>({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  amount: { type: Number, required: true },
  checkoutSessionId: { type: String, required: true },
  transactionId: { type: String, default: null }, // Unique identifier from Stripe
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  paymentDate: { type: Date, default: Date.now },
  paymentMethod: { type: String, required: true }, // For example, "stripe", "paypal", etc.
});

export const paymentModel = mongoose.model<Payment>('Payment', paymentSchema);
