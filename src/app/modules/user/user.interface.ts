
export interface IUser {
  name: string;
  email: string;
  password: string;
  photo: string;
  role: 'admin' | 'user';
  createdAt?: Date;
  updatedAt?: Date;
}
