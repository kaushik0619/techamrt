import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase } from './db';
import authRoutes from './routes/auth';
import productsRoutes from './routes/products';
import cartRoutes from './routes/cart';
import ordersRoutes from './routes/orders';
import adminRoutes from './routes/admin';
import miscRoutes from './routes/misc';
import whatsappWebhookRoutes from './routes/whatsappWebhook';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://accessoriesbutcheaper.com',
    'https://www.accessoriesbutcheaper.com',
    'https://accessoriesbutcheaper.onrender.com',
    'https://techamrt.vercel.app',
    process.env.FRONTEND_URL || ''
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200
}));

// Handle preflight requests explicitly
app.options('*', cors());

app.use(express.json());

// Request logging middleware (helpful for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/misc', miscRoutes);
app.use('/webhook/whatsapp', whatsappWebhookRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TechMart API is running' });
});

// Debug endpoint to confirm which host handled the request and inspect headers
app.get('/api/debug/whoami', (req, res) => {
  try {
    const payload = {
      hostname: req.hostname,
      ip: req.ip,
      method: req.method,
      path: req.path,
      origin: req.headers.origin || null,
      hostHeader: req.headers.host || null,
      timestamp: new Date().toISOString(),
    };
    console.log('/api/debug/whoami called:', payload);
    res.json({ ok: true, ...payload });
  } catch (err) {
    console.error('Error in /api/debug/whoami', err);
    res.status(500).json({ ok: false, error: 'Internal error' });
  }
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
      console.log(`✅ CORS enabled for multiple origins including localhost:5173`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to connect to the database', error);
    process.exit(1);
  });