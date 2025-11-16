import { ObjectId } from 'mongodb';

export interface SalesEvent {
  _id?: ObjectId;
  order_id: ObjectId;
  region: string;
  product_id: ObjectId;
  quantity: number;
  amount: number;
  timestamp?: Date;
}

export interface SalesEventInsert {
  order_id: ObjectId;
  region: string;
  product_id: ObjectId;
  quantity: number;
  amount: number;
}

export interface SalesEventUpdate {
  region?: string;
  quantity?: number;
  amount?: number;
}
