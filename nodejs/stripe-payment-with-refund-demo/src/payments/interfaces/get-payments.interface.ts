import { FilterQuery } from 'mongoose';
import { Payment } from './payment.interface';

export interface GetPaymentsInput {
  filter: FilterQuery<Payment>;
}

export interface GetPaymentsOutput {
  payments: Payment[];
}
