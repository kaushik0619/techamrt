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

/**
 * Shared function to finalize an order in the database.
 * This is used by both COD and Razorpay verification flows.
 */
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

  // 1. Create the main order document
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

  // 2. Create order items, update product stock, and create sales events
  const orderItems = [];
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

    orderItems.push({
      name: cartItem.product.name,
      quantity: cartItem.quantity,
      price: cartItem.product.price,
    });
  }

  // 3. Clear the user's cart
  await cartCollection.deleteMany({ user_id: userId });

    // 4. Send order confirmation via email and WhatsApp in parallel (non-blocking)
    try {
      const notificationPayload = {
        orderId: orderId.toString(),
        customerName: customerName || shippingAddress.fullName,
        customerEmail: customerEmail,
        customerPhone: shippingAddress.phone,
        orderDate: new Date(),
        items: orderItems,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        paymentStatus: orderData.payment_status || 'pending', // Add fallback value
        shippingAddress: shippingAddress,
      };

      const emailPromise = sendOrderConfirmationEmails(notificationPayload as any);
      const waPromise = sendOrderConfirmationWhatsApp(notificationPayload as any);

      Promise.allSettled([emailPromise, waPromise]).then((results) => {
        results.forEach((r, idx) => {
          if (r.status === 'fulfilled') {
            console.log(`✅ Notification ${idx} sent successfully`);
          } else {
            console.error(`❌ Notification ${idx} failed:`, r.reason);
          }
        });
      });
    } catch (notifyError) {
      console.error('❌ Error starting notifications for order:', notifyError);
    }

  return orderId;
}

// Route 1: Create a Razorpay Order ID
router.post('/razorpay/create-order', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const db = await connectToDatabase();
    const cartCollection = db.collection<CartItem>('cart_items');

    const cartItems = await cartCollection.aggregate([
        { $match: { user_id: req.user._id } },
        { $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' }
    ]).toArray();

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const totalAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const options = {
      amount: totalAmount * 100, // amount in the smallest currency unit (paise for INR)
      currency: 'INR',
      receipt: `receipt_order_${new Date().getTime()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Server error while creating Razorpay order' });
  }
});

// Route 2: Verify Razorpay Payment and Create Final Order
router.post('/razorpay/verify', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, shippingAddress } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !shippingAddress) {
      return res.status(400).json({ message: 'Missing payment verification details' });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Signature is valid, now create the order in our database
    const db = await connectToDatabase();
    const cartCollection = db.collection<CartItem>('cart_items');
    const usersCollection = db.collection('users');
    
    const cartItems = await cartCollection.aggregate([
        { $match: { user_id: req.user._id } },
        { $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' }
    ]).toArray();
    
    const totalAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    // Get user email
    const user = await usersCollection.findOne({ _id: req.user._id });
    const customerEmail = user?.email || '';
    const customerName = user?.name || '';

    const paymentDetails = { razorpay_order_id, razorpay_payment_id, razorpay_signature };

    const orderId = await createFinalOrder(
      db, 
      req.user._id, 
      shippingAddress, 
      'razorpay', 
      cartItems, 
      totalAmount, 
      paymentDetails,
      customerEmail,
      customerName
    );

    res.status(201).json({ message: 'Order created successfully', orderId });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Server error while verifying payment' });
  }
});

export default router;
