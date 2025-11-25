import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../db';
import { Order, OrderInsert, OrderWithItems } from '../models/Order';
import { OrderItem, OrderItemInsert } from '../models/OrderItem';
import { CartItem } from '../models/CartItem';
import { Product } from '../models/Product';
import { SalesEvent, SalesEventInsert } from '../models/SalesEvent';
import { User } from '../models/User';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { sendOrderConfirmationEmails, sendOrderStatusUpdateEmails } from '../services/emailService';
import { sendOrderConfirmationWhatsApp, sendOrderStatusUpdateWhatsApp } from '../services/whatsappService';

const router = Router();

// GET /api/orders - Get user's orders
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const db = await connectToDatabase();
    const ordersCollection = db.collection<Order>('orders');
    const orderItemsCollection = db.collection<OrderItem>('order_items');
    const productsCollection = db.collection<Product>('products');

    const orders = await ordersCollection
      .find({ user_id: req.user._id })
      .sort({ created_at: -1 })
      .toArray();

    // Get order items for each order
    const ordersWithItems: OrderWithItems[] = await Promise.all(
      orders.map(async (order) => {
        const items = await orderItemsCollection
          .aggregate([
            { $match: { order_id: order._id } },
            {
              $lookup: {
                from: 'products',
                localField: 'product_id',
                foreignField: '_id',
                as: 'product'
              }
            },
            { $unwind: '$product' },
            {
              $project: {
                _id: 1,
                product_id: 1,
                quantity: 1,
                price: 1,
                product: {
                  _id: '$product._id',
                  name: '$product.name',
                  images: '$product.images'
                }
              }
            }
          ])
          .toArray() as any as OrderWithItems['items'];

        return {
          ...order,
          items,
          user: {
            _id: req.user!._id,
            username: req.user!.username,
            email: req.user!.email
          }
        };
      })
    );

    res.json(ordersWithItems);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

// GET /api/orders/:id - Get single order details
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const db = await connectToDatabase();
    const ordersCollection = db.collection<Order>('orders');
    const orderItemsCollection = db.collection<OrderItem>('order_items');
    const productsCollection = db.collection<Product>('products');

    const order = await ordersCollection.findOne({
      _id: new ObjectId(id),
      user_id: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const items = await orderItemsCollection
      .aggregate([
        { $match: { order_id: order._id } },
        {
          $lookup: {
            from: 'products',
            localField: 'product_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $project: {
            _id: 1,
            product_id: 1,
            quantity: 1,
            price: 1,
            product: {
              _id: '$product._id',
              name: '$product.name',
              images: '$product.images'
            }
          }
        }
      ])
      .toArray() as any as OrderWithItems['items'];

    const orderWithItems: OrderWithItems = {
      ...order,
      items,
      user: {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email
      }
    };

    res.json(orderWithItems);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error while fetching order' });
  }
});

// POST /api/orders - Create new order from cart
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { shippingAddress, paymentMethod = 'cod' } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    const db = await connectToDatabase();
    const cartCollection = db.collection<CartItem>('cart_items');
    const ordersCollection = db.collection<Order>('orders');
    const orderItemsCollection = db.collection<OrderItem>('order_items');
    const productsCollection = db.collection<Product>('products');
    const salesEventsCollection = db.collection<SalesEvent>('sales_events');

    // Get cart items with product details
    const cartItems = await cartCollection
      .aggregate([
        { $match: { user_id: req.user._id } },
        {
          $lookup: {
            from: 'products',
            localField: 'product_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' }
      ])
      .toArray();

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate stock and calculate total
    let totalAmount = 0;
    // temporary container for items before we attach order_id
    const orderItems: Array<{ product_id: ObjectId; quantity: number; price: number }> = [];

    for (const cartItem of cartItems) {
      const product = cartItem.product;
      
      if (product.stock < cartItem.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }

      const itemTotal = product.price * cartItem.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product_id: cartItem.product_id,
        quantity: cartItem.quantity,
        price: product.price
      });
    }

    // Create order document (fill required Order fields explicitly)
    const orderDoc = {
      user_id: req.user._id,
      total_amount: totalAmount,
      payment_status: 'pending' as const,
      payment_method: paymentMethod as any,
      payment_id: null,
      order_status: 'pending' as const,
      shipping_address: shippingAddress as any,
      created_at: new Date(),
      updated_at: new Date()
    };

    const orderResult = await ordersCollection.insertOne(orderDoc as any);

    if (!orderResult.insertedId) {
      throw new Error('Failed to create order');
    }

    // Create order items and update stock
    for (const item of orderItems) {
      await orderItemsCollection.insertOne({
        order_id: orderResult.insertedId,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        created_at: new Date()
      });

      // Update product stock
      await productsCollection.updateOne(
        { _id: item.product_id },
        { $inc: { stock: -item.quantity } }
      );

      // Create sales event for analytics
      const salesEvent: SalesEventInsert = {
        order_id: orderResult.insertedId,
        region: shippingAddress.state || 'Unknown',
        product_id: item.product_id,
        quantity: item.quantity,
        amount: item.price * item.quantity
      };

      await salesEventsCollection.insertOne({
        ...salesEvent,
        timestamp: new Date()
      });
    }

    // Clear cart
    await cartCollection.deleteMany({ user_id: req.user._id });

    // Update order status to processing
    await ordersCollection.updateOne(
      { _id: orderResult.insertedId },
      { 
        $set: { 
          order_status: 'processing',
          payment_status: 'completed',
          updated_at: new Date()
        } 
      }
    );

    // Get user details for email
    const usersCollection = db.collection<User>('users');
    const user = await usersCollection.findOne({ _id: req.user._id });

    // Get order items with product details (including description) for email
    const orderItemsWithProducts = await orderItemsCollection
      .aggregate([
        { $match: { order_id: orderResult.insertedId } },
        {
          $lookup: {
            from: 'products',
            localField: 'product_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' }
      ])
      .toArray() as any[];

    // Prepare email data
    const emailItems = orderItemsWithProducts.map((item: any) => ({
      name: item.product.name,
      quantity: item.quantity,
      price: item.price,
      description: item.product.description || 'No description available'
    }));

    // Send order confirmation via email and WhatsApp in parallel (non-blocking)
    try {
      const notificationPayload = {
        orderId: orderResult.insertedId.toString(),
        customerName: (shippingAddress as any).full_name || (shippingAddress as any).fullName || user?.username || 'Customer',
        customerEmail: user?.email || '',
        customerPhone: (shippingAddress as any).phone || '',
        orderDate: new Date(),
        items: emailItems,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod || 'cod',
        paymentStatus: 'completed',
        shippingAddress: {
          full_name: (shippingAddress as any).full_name || (shippingAddress as any).fullName || '',
          address_line1: (shippingAddress as any).address_line1 || (shippingAddress as any).addressLine1 || '',
          address_line2: (shippingAddress as any).address_line2 || (shippingAddress as any).addressLine2 || '',
          city: (shippingAddress as any).city || '',
          state: (shippingAddress as any).state || '',
          postal_code: (shippingAddress as any).postal_code || (shippingAddress as any).postalCode || '',
          phone: (shippingAddress as any).phone || ''
        }
      };

      // Start both notifications in parallel and don't block the HTTP response.
      const emailPromise = sendOrderConfirmationEmails(notificationPayload as any);
      const waPromise = sendOrderConfirmationWhatsApp(notificationPayload as any);

      // Log results when they settle.
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

    res.status(201).json({ 
      message: 'Order created successfully',
      orderId: orderResult.insertedId,
      totalAmount
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error while creating order' });
  }
});

// PUT /api/orders/:id - Update order status (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { order_status, payment_status } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const db = await connectToDatabase();
    const ordersCollection = db.collection<Order>('orders');

    const updateData: any = { updated_at: new Date() };
    if (order_status) updateData.order_status = order_status;
    if (payment_status) updateData.payment_status = payment_status;

    const result = await ordersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const updatedOrder = await ordersCollection.findOne({ _id: new ObjectId(id) });

    // Trigger non-blocking notifications for order status/payment updates
    try {
      const trackingInfo = (req.body && req.body.tracking_info) || (req.body && req.body.trackingInfo) || undefined;

      const notifPayload = {
        orderId: id,
        customerName: (updatedOrder as any)?.shipping_address?.full_name || (updatedOrder as any)?.shipping_address?.fullName || 'Customer',
        customerEmail: (updatedOrder as any)?.customer_email || (updatedOrder as any)?.user_email || '',
        customerPhone: (updatedOrder as any)?.shipping_address?.phone || '',
        orderStatus: updateData.order_status,
        paymentStatus: updateData.payment_status,
        trackingInfo
      };

      const emailPromise = sendOrderStatusUpdateEmails(notifPayload as any);
      const waPromise = sendOrderStatusUpdateWhatsApp({
        orderId: notifPayload.orderId,
        customerName: notifPayload.customerName,
        customerPhone: notifPayload.customerPhone,
        orderStatus: notifPayload.orderStatus,
        paymentStatus: notifPayload.paymentStatus,
        trackingInfo: notifPayload.trackingInfo
      });

      Promise.allSettled([emailPromise, waPromise]).then((results) => {
        results.forEach((r, idx) => {
          if (r.status === 'fulfilled') console.log(`✅ Order status notification ${idx} sent`);
          else console.error(`❌ Order status notification ${idx} failed:`, r.reason);
        });
      });
    } catch (notifyErr) {
      console.error('❌ Error triggering order status notifications:', notifyErr);
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Server error while updating order' });
  }
});

export default router;
