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

    // Build filter using combinable clauses. This lets us match category/subcategory
    // against primary `category`, the `categories` array, and `categoriesDetails` entries.
    const andClauses: any[] = [];

    if (category) {
      const regex = { $regex: String(category), $options: 'i' };
      andClauses.push({ $or: [
        { category: regex },
        { categories: regex },
        { 'categoriesDetails.category': regex },
        { 'categoriesDetails.subcategories': regex }
      ]});
    }

    if (subcategory) {
      const sregex = { $regex: String(subcategory), $options: 'i' };
      andClauses.push({ $or: [
        { subcategory: sregex },
        { 'categoriesDetails.subcategories': sregex },
        { category: sregex },
        { categories: sregex }
      ]});
    }

    if (brand) {
      andClauses.push({ brand: String(brand) });
    }

    if (minPrice || maxPrice) {
      const priceClause: any = {};
      if (minPrice) priceClause.$gte = Number(minPrice);
      if (maxPrice) priceClause.$lte = Number(maxPrice);
      andClauses.push({ price: priceClause });
    }

    if (search) {
      andClauses.push({ $or: [
        { name: { $regex: String(search), $options: 'i' } },
        { description: { $regex: String(search), $options: 'i' } }
      ]});
    }

    const filter: any = andClauses.length > 0 ? { $and: andClauses } : {};
    
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
    if (!productData.name || !productData.description || !productData.category || (productData.price === undefined && productData.originalPrice === undefined)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const db = await connectToDatabase();
    const productsCollection = db.collection<Product>('products');
    
    // Determine pricing fields and effective price
    const originalPrice = productData.originalPrice ?? productData.price ?? 0;
    let salePrice = productData.salePrice;
    const discountPercentage = productData.discountPercentage;

    if (salePrice === undefined && discountPercentage !== undefined) {
      salePrice = Math.max(0, +(originalPrice * (1 - Number(discountPercentage) / 100)).toFixed(2));
    }

    const effectivePrice = salePrice !== undefined ? salePrice : originalPrice;

    const newProduct: Product = {
      ...productData,
      price: effectivePrice,
      originalPrice,
      salePrice,
      discountPercentage,
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

    // If pricing fields are included in update, recalculate effective price
    if (updateData.originalPrice !== undefined || updateData.salePrice !== undefined || updateData.discountPercentage !== undefined) {
      const original = updateData.originalPrice ?? (await productsCollection.findOne({ _id: new ObjectId(id) }))?.originalPrice ?? (await productsCollection.findOne({ _id: new ObjectId(id) }))?.price ?? 0;
      let sale = updateData.salePrice;
      const disc = updateData.discountPercentage;
      if (sale === undefined && disc !== undefined) {
        sale = Math.max(0, +(original * (1 - Number(disc) / 100)).toFixed(2));
      }
      updateData.price = sale !== undefined ? sale : (updateData.originalPrice ?? original);
    }
    
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
