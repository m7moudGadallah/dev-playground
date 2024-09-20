import { Document, Model, Types } from 'mongoose';

export interface Payment extends Document {
  orderId: Types.ObjectId;
  amount: number; // Amount paid
  checkoutSessionId: string;
  transactionId: string | null; // Stripe Transaction ID or Payment Intent ID
  status: 'pending' | 'completed' | 'failed';
  paymentDate: Date;
  paymentMethod: string; // E.g., "credit_card", "paypal", etc.
}

export interface PaymentModel extends Model<Payment> {}
