import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  username: string;
  email: string;
  password_hash: string;
  role: 'customer' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}
