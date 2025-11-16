import { ObjectId } from 'mongodb';

export interface Product {
  _id?: ObjectId;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  brand?: string;
  price: number;
  stock: number;
  images: string[];
  specs: Record<string, any> | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductInsert {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  brand?: string;
  price: number;
  stock?: number;
  images?: string[];
  specs?: Record<string, any> | null;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  price?: number;
  stock?: number;
  images?: string[];
  specs?: Record<string, any> | null;
  updatedAt?: Date;
}
