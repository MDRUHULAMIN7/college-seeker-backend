import { Types } from "mongoose";

export interface IReviewPayload {
  collegeId: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  rating: number;      // 1-5
  comment: string;
}

export interface IReview {
  _id: Types.ObjectId;
  college: Types.ObjectId | {
    _id: Types.ObjectId;
    name: string;
    image: string;
    admissionDate: Date;
  };
  user: Types.ObjectId | {
    _id: Types.ObjectId;
    name: string;
    email: string;
  };
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}
