import { Router, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../db';
import { Product, ProductInsert, ProductUpdate } from '../models/Product';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/products/brands - Get unique brands
router.get('/brands', async (req: Request, res: Response) => {
  try {
    const { category, subcategory } = req.query;
    const db = await connectToDatabase();
    const productsCollection = db.collection<Product>('products');

    // If a dedicated `brands` collection exists (some deployments store
    // brands separately), prefer reading from it. This collection typically
    // stores documents like { brand_name: 'Apple', category: 'Smartphones', ... }
    // which makes it straightforward to return brand cards for a given
    // category string (e.g. 'Smartphones' or 'phone').
    const brandsCollection = db.collection('brands');
    try {
      const brandsCount = await brandsCollection.countDocuments();
      if (brandsCount > 0) {
        const query: any = {};
        if (category) {
          // match category case-insensitively (allow partial matches)
          query.category = { $regex: String(category), $options: 'i' };
        } else if (subcategory) {
          query.category = { $regex: String(subcategory), $options: 'i' };
        }

        const docs = await brandsCollection.find(query).toArray();
        const brandNames = docs.map((d: any) => d.brand_name || d.name).filter(Boolean);
        // Deduplicate and return
        return res.json(Array.from(new Set(brandNames)));
      }
    } catch (e) {
      // If brands collection isn't present or read fails, fall back to products
      console.warn('brands collection read failed, falling back to products.distinct', e);
    }

    const filter: any = {};
    if (category) {
      // Use case-insensitive regex matching for category to handle variations like 'spare_parts', 'Spare Parts', etc.
      filter.category = { $regex: String(category), $options: 'i' };
    }
    if (subcategory) filter.subcategory = subcategory as string;

    const brands = await productsCollection.distinct('brand', filter);
    // Filter out any null, undefined, or empty string brands
    res.json(brands.filter(b => b));
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ message: 'Server error while fetching brands' });
  }
});

// GET /api/products - List all products with optional filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, subcategory, brand, minPrice, maxPrice, search, page = 1, limit = 20 } = req.query;
    
    const db = await connectToDatabase();
    const productsCollection = db.collection<Product>('products');
    
    // Build filter object
    const filter: any = {};
    
    if (category) {
      // Use case-insensitive regex matching for category
      filter.category = { $regex: String(category), $options: 'i' };
    }
    if (subcategory) filter.subcategory = subcategory as string;
    if (brand) filter.brand = brand as string;
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
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
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    const db = await connectToDatabase();
    const productsCollection = db.collection<Product>('products');
    
    const product = await productsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error while fetching product' });
  }
});

// POST /api/products - Create product (admin only)
router.post('/', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const productData: ProductInsert = req.body;
    
    // Validate required fields
    if (!productData.name || !productData.description || !productData.category || productData.price === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const db = await connectToDatabase();
    const productsCollection = db.collection<Product>('products');
    
    const newProduct: Product = {
      ...productData,
      stock: productData.stock || 0,
      images: productData.images || [],
      specs: productData.specs || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await productsCollection.insertOne(newProduct);
    
    if (!result.insertedId) {
      throw new Error('Failed to insert product');
    }
    
    const createdProduct = await productsCollection.findOne({ _id: result.insertedId });
    
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error while creating product' });
  }
});

// PUT /api/products/:id - Update product (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: ProductUpdate = req.body;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    const db = await connectToDatabase();
    const productsCollection = db.collection<Product>('products');
    
    updateData.updatedAt = new Date();
    
    const result = await productsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const updatedProduct = await productsCollection.findOne({ _id: new ObjectId(id) });
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error while updating product' });
  }
});

// DELETE /api/products/:id - Delete product (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    const db = await connectToDatabase();
    const productsCollection = db.collection<Product>('products');
    
    const result = await productsCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
});

export default router;
