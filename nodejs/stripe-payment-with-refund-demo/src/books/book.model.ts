import { Book } from './interfaces';
import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema<Book>({
  title: {
    type: String,
    required: [true, 'book must have a title'],
  },
  author: {
    type: String,
    required: [true, 'book must have an author'],
  },
  publishedDate: {
    type: String,
    required: [true, 'book must have a publishedDate'],
  },
  genre: {
    type: String,
    required: [true, 'book must have genre'],
  },
  price: {
    type: Number,
    required: [true, 'book must have a price'],
    min: [1, 'book price must be at least 1 dollar'],
  },
  stock: {
    type: Number,
    required: [true, 'book must have a stock'],
    min: [0, 'book stock should be at least 0'],
  },
  description: {
    type: String,
    required: [true, 'book must have a description'],
  },
});

export const bookModel = mongoose.model<Book>('Book', bookSchema);
