import { Document, Model } from 'mongoose';

export interface Customer extends Document {
  name: string;
}

export interface CustomerModel extends Model<Customer> {}
