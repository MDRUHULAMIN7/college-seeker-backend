import { Schema, model } from 'mongoose';
import type { IUser } from './user.interface.js';

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'others'],
      required: [true, 'Gender is required'],
    },
    profileImg: {
      type: String,
    },
    token: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    resetPasswordToken: { type: String, required: [false] },
    resetPasswordExpire: { type: Date, required: [false] },
    resetPasswordOtp: { type: String, required: [false] },
    resetPasswordOtpExpire: { type: Date, required: [false] },
  },
  {
    timestamps: false,
  },
);

export const User = model<IUser>('User', userSchema);
