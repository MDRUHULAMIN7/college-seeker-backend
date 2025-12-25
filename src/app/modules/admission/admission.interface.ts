import { Types } from "mongoose";

export interface IAdmission {
  college: Types.ObjectId;
  candidateName: string;
  subject: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: Date;
  image: string;
  createdAt?: Date;
  updatedAt?: Date;
}
