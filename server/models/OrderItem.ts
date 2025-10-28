import { ObjectId } from 'mongodb';

export interface OrderItem {
  _id?: ObjectId;
  order_id: ObjectId;
  product_id: ObjectId;
  quantity: number;
  price: number;
  created_at?: Date;
}

export interface OrderItemInsert {
  order_id: ObjectId;
  product_id: ObjectId;
  quantity: number;
  price: number;
}

export interface OrderItemUpdate {
  quantity?: number;
  price?: number;
}
