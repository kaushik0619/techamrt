import { ObjectId } from 'mongodb';

export interface Variant {
  name: string; // e.g., 'Color', 'Size', 'Model'
  options: string[]; // e.g., ['Red', 'Blue', 'Black']
}

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
  // Variants support (e.g., color, size, model)
  variants?: Variant[];
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
  // Variants support
  variants?: Variant[];
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
  variants?: Variant[];
  updatedAt?: Date;
}
