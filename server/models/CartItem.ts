import { ObjectId } from 'mongodb';

export interface CartItem {
  _id?: ObjectId;
  user_id: ObjectId;
  product_id: ObjectId;
  quantity: number;
  added_at?: Date;
}

export interface CartItemInsert {
  user_id: ObjectId;
  product_id: ObjectId;
  quantity?: number;
}

export interface CartItemUpdate {
  quantity?: number;
}

export interface CartItemWithProduct extends CartItem {
  product: {
    _id: ObjectId;
    name: string;
    price: number;
    images: string[];
    stock: number;
  };
}
