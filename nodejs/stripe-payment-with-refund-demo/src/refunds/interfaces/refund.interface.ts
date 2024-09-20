import { Document, Model, Types } from 'mongoose';

export interface Refund extends Document {
  orderId: Types.ObjectId;
  paymentId: Types.ObjectId; // Link to Payment document
  transactionId: string; // Stripe Refund Transaction ID
  amount: number; // Refund amount
  status: 'pending' | 'completed' | 'failed';
  refundDate: Date;
}

export interface RefundModel extends Model<Refund> {}
