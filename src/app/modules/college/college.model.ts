import { Schema, model } from 'mongoose';
import type { ICollege } from "./college.interface.js";

const collegeSchema = new Schema<ICollege>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
      maxlength: 200,
    },
    admissionDate: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    researchCount: {
      type: Number,
      default: 0,
    },
    researchHistory: {
      type: String,
    },
    events: {
      type: [String],
      default: [],
    },
    sports: {
      type: [String],
      default: [],
    },
    gallery: {
      type: [String],
      default: [],
    },
    researchPapers: [
      {
        title: String,
        link: String,
      },
    ],
    description: {
      type: String,
    },
      graduates: [    
      {
        name: { type: String, required: true },
        photo: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);
export const College = model<ICollege>('College', collegeSchema);