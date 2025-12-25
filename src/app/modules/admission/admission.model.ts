import { Schema, model } from "mongoose";
import type { IAdmission } from "./admission.interface.js";

const admissionSchema = new Schema<IAdmission>(
  {
    college: {
      type: Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },

    candidateName: {
      type: String,
      required: true,
      trim: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
  Prevent duplicate admission
 */
admissionSchema.index(
  { email: 1, college: 1 },
  { unique: true }
);

export const Admission = model<IAdmission>(
  "Admission",
  admissionSchema
);
