
import type { Types } from 'mongoose';

export interface ILibrary {
  user: Types.ObjectId;
  book: Types.ObjectId;

  shelf: 'want' | 'reading' | 'read';

  progress: number;        
  startedAt?: Date;       
  finishedAt?: Date;     

  createdAt?: Date;
  updatedAt?: Date;
}

