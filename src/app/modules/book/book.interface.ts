
import type { Types } from 'mongoose';

export interface IBook {
  title: string;
  author: string;
  genre: Types.ObjectId;
  description: string;
  summary: string;
  coverImage: string;
}

