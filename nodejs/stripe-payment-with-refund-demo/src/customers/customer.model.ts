import { Customer } from './interfaces';
import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema<Customer>({
  name: {
    type: String,
    required: [true, 'customer must have a name'],
  },
});

export const customerModel = mongoose.model<Customer>(
  'Customer',
  customerSchema,
);
