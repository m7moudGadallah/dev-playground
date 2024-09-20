import { FilterQuery } from 'mongoose';
import { Customer } from './customer.interface';

export interface GetCustomersInput {
  filter: FilterQuery<Customer>;
}

export interface GetCustomersOutput {
  customers: Partial<Customer>[];
}
