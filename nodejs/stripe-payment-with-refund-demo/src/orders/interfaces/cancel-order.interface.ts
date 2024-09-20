import { Types } from 'mongoose';

export interface CancelOrderInput {
  orderId: Types.ObjectId;
}

export interface CancelOrderOutput {
  refundId: string | null;
}
