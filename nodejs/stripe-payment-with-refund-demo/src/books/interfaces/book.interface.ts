import { Document } from 'mongoose';
import { Model } from 'mongoose';

export interface Book extends Document {
  title: string;
  author: string;
  publishedDate: string; // You could use `Date` but typically in JSON it's represented as a string
  genre: string;
  price: number;
  stock: number; // Number of copies available
  description: string;
}

export interface BookModel extends Model<Book> {}
