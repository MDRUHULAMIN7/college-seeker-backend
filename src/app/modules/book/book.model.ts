
import { Schema, model } from 'mongoose';
import type { IBook } from './book.interface.js';

const bookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: [true, 'Book Title is required'],
      unique: true,
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    summary: {
      type: String,
      required: [true, 'Summary is required'],
    },
    coverImage: {
      type: String,
      required: [true, 'Cover Image is required'],
    },
    genre: {
      type: Schema.Types.ObjectId,
      ref: 'Genre',
      required: [true, 'Genre is Required'],
    },
  },
  {
    timestamps: true, 
  },
);

// Index for faster searches
bookSchema.index({ title: 'text', author: 'text' });
bookSchema.index({ genre: 1 });

export const Book = model<IBook>('Book', bookSchema);