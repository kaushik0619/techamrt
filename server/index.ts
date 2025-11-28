const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://accessoriesbutcheaper.com",
  "https://www.accessoriesbutcheaper.com",
  "https://accessoriesbutcheaper.onrender.com",
  "https://techamrt.onrender.com",
  "https://techamrt.vercel.app",      // production vercel URL
  process.env.FRONTEND_URL || ""
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    // allow normal origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // allow ALL vercel preview URLs
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
  maxAge: 86400,
}));

app.options("*", cors());
