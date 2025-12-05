import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  username: string;
  email: string;
  password_hash: string;
  role: 'customer' | 'admin';
  resetToken?: string;
  resetTokenExpiry?: Date;
  refreshToken?: string;
  // refreshTokenExpiry may come back as a Date or an ISO string from DB drivers
  refreshTokenExpiry?: Date | string;
  createdAt: Date;
  updatedAt: Date;
}