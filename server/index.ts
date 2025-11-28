import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Routes
import authRoutes from "./routes/auth";
import productsRoutes from "./routes/products";
import cartRoutes from "./routes/cart";
import ordersRoutes from "./routes/orders";
import adminRoutes from "./routes/admin";
import miscRoutes from "./routes/misc";
import whatsappWebhookRoutes from "./routes/whatsappWebhook";
import { connectToDatabase } from "./db";

dotenv.config();

// Create Express App FIRST
const app = express();
const PORT = process.env.PORT || 3001;

// --------------------------------------
// ✅ CORS CONFIGURATION
// --------------------------------------
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://accessoriesbutcheaper.com",
  "https://www.accessoriesbutcheaper.com",
  "https://accessoriesbutcheaper.onrender.com",
  "https://techamrt.onrender.com",
  "https://techamrt.vercel.app",
  process.env.FRONTEND_URL || ""
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow server-to-server / curl

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow ALL Vercel preview URLs
      if (/\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      console.log("❌ BLOCKED BY CORS:", origin);
      return callback(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"],
    maxAge: 86400
  })
);

// Handle preflight explicitly
app.options("*", cors());

// --------------------------------------
// Middleware
// --------------------------------------
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// --------------------------------------
// API ROUTES
// --------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/misc", miscRoutes);
app.use("/webhook/whatsapp", whatsappWebhookRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "TechMart API is running" });
});

// Debug route
app.get("/api/debug/whoami", (req, res) => {
  const payload = {
    hostname: req.hostname,
    ip: req.ip,
    method: req.method,
    path: req.path,
    origin: req.headers.origin || null,
    hostHeader: req.headers.host,
    timestamp: new Date().toISOString()
  };

  console.log("🔍 /api/debug/whoami", payload);
  res.json({ ok: true, ...payload });
});

// Default route
app.get("/", (req, res) => {
  res.send("TechMart API is running. Visit /api/health for status.");
});

// --------------------------------------
// ERROR HANDLER
// --------------------------------------
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("💥 Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err : {}
  });
});

// --------------------------------------
// START SERVER
// --------------------------------------
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`🌐 Allowed origins:`, allowedOrigins);
    });
  })
  .catch((error) => {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1);
  });
