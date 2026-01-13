import { Schema, model } from 'mongoose';
import type { ILibrary } from './library.interface.js';

const librarySchema = new Schema<ILibrary>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    book: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },

    shelf: {
      type: String,
      enum: ['want', 'reading', 'read'],
      required: true,
      default: 'want',
    },

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    startedAt: {
      type: Date,
    },

    finishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);



export const Library = model<ILibrary>('Library', librarySchema);
