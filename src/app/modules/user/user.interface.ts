export type Gender = 'male' | 'female' | 'others';

export interface IUser {
  name: string;
  email: string;
  password: string;
  gender: Gender;
  token:string,
  profileImg?: string;
  resetPasswordToken?: string,
  resetPasswordExpire?: Date,
  resetPasswordOtp?: string,
  resetPasswordOtpExpire?: Date,
  createdAt?: Date;
}
