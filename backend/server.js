import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import eventRoutes from "./routes/eventRoutes.js";
import guestRoutes from "./routes/guestRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import collaboratorRoutes from "./routes/collaboratorRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import { initAlertEngine } from "./utils/alertService.js";
import mongoSanitize from "express-mongo-sanitize";
import {
  authRateLimiter,
  publicRateLimiter,
  authenticatedRateLimiter
} from "./middleware/rateLimiter.js";
import {
  securityHeadersMiddleware,
  setCustomSecurityHeaders
} from "./middleware/securityHeaders.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Initialize AI Tactical Engines
initAlertEngine();

const app = express();
const PORT = process.env.PORT || 5001;

// --- Production Security Hardening & Headers ---
app.use(securityHeadersMiddleware);
app.use(setCustomSecurityHeaders);
app.use(cookieParser());

// --- Multi-Tenant CORS Strategy ---
const allowedOrigins = [
  "http://localhost:5173",
  "https://planora-smart-event-os-web.vercel.app",
  "https://planora-smart-event-os-ojt-2-6zpq.vercel.app",
  "https://planora-os.com",
  "https://www.planora-os.com"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow if no origin (like mobile apps/curl), if in allowed list, 
    // or if it's a Vercel preview deployment (*.vercel.app)
    const isVercel = origin && origin.endsWith(".vercel.app");
    
    if (!origin || allowedOrigins.includes(origin) || isVercel || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.warn(`[Security Alert] CORS Blocked for origin: ${origin}`);
      callback(new Error('Cross-Origin Access Restricted by Planora Security Protocol'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ limit: '50kb', extended: true }));

// NoSQL Injection Protection
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ key, req }) => {
    console.warn('NoSQL injection attempt:', key, req.ip);
  }
}));

// Ensure DB connection for every request (singleton handles efficiency)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(503).json({ message: "Database connection failed. Please check backend logs and IP whitelisting." });
  }
});

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Tiered Rate-Limited Routes
// 1. Strict Authentication Routes (Per-IP & Per-Account + Exponential Backoff)
app.use("/api/auth", authRateLimiter, authRoutes);

// 2. Moderate Public Routes
app.use("/api/search", publicRateLimiter, searchRoutes);

// 3. Looser Authenticated Feature Routes
app.use("/api/events", authenticatedRateLimiter, eventRoutes);
app.use("/api/guests", authenticatedRateLimiter, guestRoutes);
app.use("/api/vendors", authenticatedRateLimiter, vendorRoutes);
app.use("/api/tasks", authenticatedRateLimiter, taskRoutes);
app.use("/api/ai", authenticatedRateLimiter, aiRoutes);
app.use("/api/collaborators", authenticatedRateLimiter, collaboratorRoutes);
app.use("/api/upload", authenticatedRateLimiter, uploadRoutes);

// Static files for uploads with strict non-executable response headers
if (process.env.NODE_ENV !== "production") {
  const staticUploadHandler = express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Content-Security-Policy", "default-src 'none'");
      res.setHeader("X-Frame-Options", "DENY");
    }
  });
  app.use("/api/uploads", staticUploadHandler);
  app.use("/uploads", staticUploadHandler);
}

// Test route with Public Rate Limiter
app.get("/", publicRateLimiter, (req, res) => {
  res.json({ message: "Planora backend running 🚀" });
});

// Health check with Public Rate Limiter
app.get("/health", publicRateLimiter, (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Only listen if executed directly (not imported as a module) and not in production serverless environment
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun && process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    console.log(`✅ Planora backend running at http://localhost:${PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`⚠️  Port ${PORT} is already in use by a background process.`);
      console.error(`👉 Run 'lsof -ti:${PORT} | xargs kill -9' to free port ${PORT}.`);
      process.exit(1);
    }
  });
}

// Global Error Handler - Operational Integrity
app.use((err, req, res, next) => {
  console.error(`[Operational Failure] ${err.name}: ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  // Ensure CORS headers are present even in failure states
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  
  res.status(500).json({ 
    message: "An unexpected internal server error occurred. Please try again later."
  });
});

export default app;
