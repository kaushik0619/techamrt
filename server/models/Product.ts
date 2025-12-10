import { ObjectId } from 'mongodb';

export interface Product {
  _id?: ObjectId;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  brand?: string;
  // `price` remains the effective price used by the storefront (salePrice if present, otherwise originalPrice)
  price: number;
  // New fields to support discounts
  originalPrice?: number;
  salePrice?: number;
  discountPercentage?: number;
  // Allow assigning a product to multiple categories (optional)
  categories?: string[];
  // Details for each category (category + selected subcategories)
  categoriesDetails?: Array<{ category: string; subcategories?: string[] }>;
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
  // allow both originalPrice and salePrice (or legacy `price`)
  price?: number;
  originalPrice?: number;
  salePrice?: number;
  discountPercentage?: number;
  categories?: string[];
  categoriesDetails?: Array<{ category: string; subcategories?: string[] }>;
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
  originalPrice?: number;
  salePrice?: number;
  discountPercentage?: number;
  categories?: string[];
  categoriesDetails?: Array<{ category: string; subcategories?: string[] }>;
  stock?: number;
  images?: string[];
  specs?: Record<string, any> | null;
  updatedAt?: Date;
}
