import { Router, Response } from 'express';
import { Db, ObjectId } from 'mongodb';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { connectToDatabase } from '../db';
import { CartItem } from '../models/CartItem';
import { OrderInsert } from '../models/Order';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { sendOrderConfirmationEmails } from '../services/emailService';
import { sendOrderConfirmationWhatsApp } from '../services/whatsappService';

const router = Router();

// Initialize Razorpay client
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/* ---------------- CREATE FINAL ORDER ---------------- */
export async function createFinalOrder(
  db: Db,
  userId: ObjectId,
  shippingAddress: any,
  paymentMethod: 'cod' | 'razorpay',
  cartItems: any[],
  totalAmount: number,
  paymentDetails: any = {},
  customerEmail: string = '',
  customerName: string = ''
) {
  const ordersCollection = db.collection('orders');
  const orderItemsCollection = db.collection('order_items');
  const productsCollection = db.collection('products');
  const salesEventsCollection = db.collection('sales_events');
  const cartCollection = db.collection('cart_items');

  const orderData: OrderInsert = {
    user_id: userId,
    total_amount: totalAmount,
    payment_status: paymentMethod === 'cod' ? 'pending' : 'completed',
    payment_method: paymentMethod,
    order_status: 'processing',
    shipping_address: shippingAddress,
    ...paymentDetails,
  };

  const orderResult = await ordersCollection.insertOne({
    ...orderData,
    created_at: new Date(),
    updated_at: new Date(),
  });

  if (!orderResult.insertedId) {
    throw new Error('Failed to create order');
  }

  const orderId = orderResult.insertedId;

  for (const cartItem of cartItems) {
    await orderItemsCollection.insertOne({
      order_id: orderId,
      product_id: cartItem.product_id,
      quantity: cartItem.quantity,
      price: cartItem.product.price,
      created_at: new Date(),
    });

    await productsCollection.updateOne(
      { _id: cartItem.product_id },
      { $inc: { stock: -cartItem.quantity } }
    );

    await salesEventsCollection.insertOne({
      order_id: orderId,
      region: shippingAddress.state || 'Unknown',
      product_id: cartItem.product_id,
      quantity: cartItem.quantity,
      amount: cartItem.product.price * cartItem.quantity,
      timestamp: new Date(),
    });
  }

  await cartCollection.deleteMany({ user_id: userId });

  return orderId;
}

/* ---------------- CREATE RAZORPAY ORDER ---------------- */
router.post('/razorpay/create-order', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'User not authenticated' });

    const db = await connectToDatabase();
    const cartCollection = db.collection<CartItem>('cart_items');

    const cartItems = await cartCollection.aggregate([
      { $match: { user_id: req.user._id } },
      { $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' }
    ]).toArray();

    if (cartItems.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    const totalAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const options = {
      amount: totalAmount * 100,
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };

    console.log('Creating Razorpay order:', options);

    const order = await razorpay.orders.create(options);

    console.log('Razorpay response:', { id: order.id, amount: order.amount, currency: order.currency });

    // FIXED: Return id instead of orderId
    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Server error while creating Razorpay order' });
  }
});

/* ---------------- VERIFY RAZORPAY PAYMENT ---------------- */
router.post('/razorpay/verify', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'User not authenticated' });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, shippingAddress } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !shippingAddress) {
      return res.status(400).json({ message: 'Missing payment verification details' });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const db = await connectToDatabase();
    const cartCollection = db.collection<CartItem>('cart_items');
    const usersCollection = db.collection('users');

    const cartItems = await cartCollection.aggregate([
      { $match: { user_id: req.user._id } },
      { $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' }
    ]).toArray();

    const totalAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const user = await usersCollection.findOne({ _id: req.user._id });

    const paymentDetails = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    };

    const orderId = await createFinalOrder(
      db,
      req.user._id,
      shippingAddress,
      'razorpay',
      cartItems,
      totalAmount,
      paymentDetails,
      user?.email || '',
      user?.name || ''
    );

    res.status(201).json({ message: 'Order created successfully', orderId });

  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    res.status(500).json({ message: 'Server error while verifying payment' });
  }
});

export default router;
