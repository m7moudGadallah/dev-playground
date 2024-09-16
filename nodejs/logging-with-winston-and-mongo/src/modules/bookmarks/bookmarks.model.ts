import mongoose from 'mongoose';
import { Bookmark } from './interfaces';
import validator from 'validator';

const bookmarkSchema = new mongoose.Schema<Bookmark>({
  title: {
    type: String,
    required: [true, 'bookmark must have a title'],
    trim: true,
  },
  url: {
    type: String,
    required: [true, 'bookmark must have a url'],
    validate: {
      validator: (value: string) => validator.isURL(value),
      message: 'invalid url',
    },
  },
  description: {
    type: String,
    trim: true,
    required: false,
  },
});

export const BookmarkModel = mongoose.model<Bookmark>(
  'Bookmark',
  bookmarkSchema,
);
