import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../db';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { SalesEvent } from '../models/SalesEvent';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/admin/stats - Dashboard statistics
router.get('/stats', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await connectToDatabase();
    const ordersCollection = db.collection<Order>('orders');
    const productsCollection = db.collection<Product>('products');
    const usersCollection = db.collection<User>('users');

    const [totalOrders, totalRevenue, totalCustomers, totalProducts] = await Promise.all([
      ordersCollection.countDocuments(),
      ordersCollection.aggregate([
        { $match: { payment_status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$total_amount' } } }
      ]).toArray().then(result => result[0]?.total || 0),
      usersCollection.countDocuments({ role: 'customer' }),
      productsCollection.countDocuments()
    ]);

    res.json({
      totalOrders,
      totalRevenue,
      totalCustomers,
      totalProducts
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error while fetching stats' });
  }
});

// GET /api/admin/sales-by-region - Regional sales data
router.get('/sales-by-region', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await connectToDatabase();
    const salesEventsCollection = db.collection<SalesEvent>('sales_events');

    const salesByRegion = await salesEventsCollection
      .aggregate([
        {
          $group: {
            _id: '$region',
            amount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            region: '$_id',
            amount: 1,
            count: 1,
            _id: 0
          }
        },
        { $sort: { amount: -1 } }
      ])
      .toArray();

    res.json(salesByRegion);
  } catch (error) {
    console.error('Error fetching sales by region:', error);
    res.status(500).json({ message: 'Server error while fetching sales data' });
  }
});

// GET /api/admin/recent-orders - Recent orders with user info
router.get('/recent-orders', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    
    const db = await connectToDatabase();
    const ordersCollection = db.collection<Order>('orders');

    const recentOrders = await ordersCollection
      .aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            _id: 1,
            created_at: 1,
            total_amount: 1,
            order_status: 1,
            payment_status: 1,
            user: {
              _id: '$user._id',
              username: '$user.username',
              email: '$user.email'
            }
          }
        },
        { $sort: { created_at: -1 } },
        { $limit: Number(limit) }
      ])
      .toArray();

    res.json(recentOrders);
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({ message: 'Server error while fetching recent orders' });
  }
});

// GET /api/admin/products - Get all products for admin management
router.get('/products', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, search, category } = req.query;
    
    const db = await connectToDatabase();
    const productsCollection = db.collection<Product>('products');
    
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      filter.category = category;
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const [products, total] = await Promise.all([
      productsCollection
        .find(filter)
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 })
        .toArray(),
      productsCollection.countDocuments(filter)
    ]);
    
    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
});

// DELETE /api/admin/products/:id - Delete a product
router.delete('/products/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    const db = await connectToDatabase();
    const productsCollection = db.collection<Product>('products');

    const result = await productsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
});


// GET /api/admin/orders - Get all orders for admin management
router.get('/orders', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status, payment_status } = req.query;
    
    const db = await connectToDatabase();
    const ordersCollection = db.collection<Order>('orders');
    
    const filter: any = {};
    
    if (status) {
      filter.order_status = status;
    }
    
    if (payment_status) {
      filter.payment_status = payment_status;
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const [orders, total] = await Promise.all([
      ordersCollection
        .aggregate([
          { $match: filter },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          { $unwind: '$user' },
          {
            $project: {
              _id: 1,
              created_at: 1,
              total_amount: 1,
              order_status: 1,
              payment_status: 1,
              payment_method: 1,
              user: {
                _id: '$user._id',
                username: '$user.username',
                email: '$user.email'
              }
            }
          },
          { $sort: { created_at: -1 } },
          { $skip: skip },
          { $limit: Number(limit) }
        ])
        .toArray(),
      ordersCollection.countDocuments(filter)
    ]);
    
    res.json({
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

export default router;
