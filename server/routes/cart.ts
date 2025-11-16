import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../db';
import { CartItem, CartItemInsert, CartItemWithProduct } from '../models/CartItem';
import { Product } from '../models/Product';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/cart - Get user's cart items
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const db = await connectToDatabase();
    const cartCollection = db.collection<CartItem>('cart_items');
    const productsCollection = db.collection<Product>('products');

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
        { $unwind: '$product' },
        {
          $project: {
            _id: 1,
            user_id: 1,
            product_id: 1,
            quantity: 1,
            added_at: 1,
            product: {
              _id: '$product._id',
              name: '$product.name',
              price: '$product.price',
              images: '$product.images',
              stock: '$product.stock'
            }
          }
        }
      ])
      .toArray();

    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error while fetching cart' });
  }
});

// POST /api/cart - Add item to cart
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { productId, quantity = 1 } = req.body;

    if (!productId || !ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Valid product ID is required' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    const db = await connectToDatabase();
    const cartCollection = db.collection<CartItem>('cart_items');
    const productsCollection = db.collection<Product>('products');

    // Check if product exists and has stock
    const product = await productsCollection.findOne({ _id: new ObjectId(productId) });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Check if item already exists in cart
    const existingItem = await cartCollection.findOne({
      user_id: req.user._id,
      product_id: new ObjectId(productId)
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({ message: 'Insufficient stock for requested quantity' });
      }

      await cartCollection.updateOne(
        { _id: existingItem._id },
        { $set: { quantity: newQuantity } }
      );
    } else {
      // Add new item
      const cartItem: CartItem = {
        user_id: req.user._id,
        product_id: new ObjectId(productId),
        quantity,
        added_at: new Date()
      };

      await cartCollection.insertOne(cartItem);
    }

    res.status(201).json({ message: 'Item added to cart successfully' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error while adding to cart' });
  }
});

// PUT /api/cart/:id - Update cart item quantity
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const { quantity } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid cart item ID' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    const db = await connectToDatabase();
    const cartCollection = db.collection<CartItem>('cart_items');
    const productsCollection = db.collection<Product>('products');

    // Check if cart item exists and belongs to user
    const cartItem = await cartCollection.findOne({
      _id: new ObjectId(id),
      user_id: req.user._id
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Check stock availability
    const product = await productsCollection.findOne({ _id: cartItem.product_id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Update quantity
    await cartCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { quantity } }
    );

    res.json({ message: 'Cart item updated successfully' });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Server error while updating cart item' });
  }
});

// DELETE /api/cart/:id - Remove item from cart
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid cart item ID' });
    }

    const db = await connectToDatabase();
    const cartCollection = db.collection<CartItem>('cart_items');

    const result = await cartCollection.deleteOne({
      _id: new ObjectId(id),
      user_id: req.user._id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Server error while removing from cart' });
  }
});

// DELETE /api/cart - Clear entire cart
router.delete('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const db = await connectToDatabase();
    const cartCollection = db.collection<CartItem>('cart_items');

    await cartCollection.deleteMany({ user_id: req.user._id });

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error while clearing cart' });
  }
});

export default router;
