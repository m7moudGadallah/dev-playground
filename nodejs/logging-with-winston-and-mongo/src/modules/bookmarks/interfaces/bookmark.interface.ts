import { Document } from 'mongoose';

export interface Bookmark extends Document {
  title: string;
  url: string;
  description?: string;
}
