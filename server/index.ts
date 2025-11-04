import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase } from './db';
import authRoutes from './routes/auth';
import productsRoutes from './routes/products';
import cartRoutes from './routes/cart';
import ordersRoutes from './routes/orders';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://accessoriesbutcheaper.onrender.com',  // ← Add your production frontend URL
    process.env.FRONTEND_URL || ''  // ← Also allow from env variable
  ].filter(Boolean),  // Remove empty strings
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TechMart API is running' });
});

// Default route
app.get('/', (req, res) => {
  res.send('TechMart API is running. Visit /api/health for status.');
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server is running on http://localhost:${PORT}`);
      console.log(`✅ API available at http://localhost:${PORT}/api`);
      console.log(`✅ CORS enabled for: http://localhost:5173, https://accessoriesbutcheaper.onrender.com`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to connect to the database', error);
    process.exit(1);
  });