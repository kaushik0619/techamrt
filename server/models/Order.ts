import { ObjectId } from 'mongodb';

export interface Order {
  _id?: ObjectId;
  user_id: ObjectId;
  total_amount: number;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: 'stripe' | 'razorpay' | 'cod' | null;
  payment_id: string | null;
  order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: {
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  created_at?: Date;
  updated_at?: Date;
}

export interface OrderInsert {
  user_id: ObjectId;
  total_amount: number;
  payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: 'stripe' | 'razorpay' | 'cod' | null;
  payment_id?: string | null;
  order_status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: {
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export interface OrderUpdate {
  payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: 'stripe' | 'razorpay' | 'cod' | null;
  payment_id?: string | null;
  order_status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address?: {
    full_name?: string;
    phone?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  updated_at?: Date;
}

export interface OrderWithItems extends Order {
  items: {
    _id: ObjectId;
    product_id: ObjectId;
    quantity: number;
    price: number;
    product: {
      _id: ObjectId;
      name: string;
      images: string[];
    };
  }[];
  user: {
    _id: ObjectId;
    username: string;
    email: string;
  };
}
