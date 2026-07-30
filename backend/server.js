import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Initialize AI Tactical Engines
initAlertEngine();

const app = express();
const PORT = process.env.PORT || 5001;

// --- Multi-Tenant CORS Strategy ---
const allowedOrigins = [
  "http://localhost:5173",
  "https://planora-smart-event-os-web.vercel.app",
  "https://planora-smart-event-os-ojt-2-6zpq.vercel.app"
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

// Routes
app.use("/api/events", eventRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/collaborators", collaboratorRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/search", searchRoutes);

// Static files for uploads (prefixed with /api to match VITE_API_URL expectations)
// Note: Local static serving is disabled in production to prevent Vercel boot-time conflicts.
if (process.env.NODE_ENV !== "production") {
  app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));
}

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Planora backend running 🚀" });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Only listen if not in a serverless environment and not testing
if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
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
  console.error(err.stack);
  
  // Proactive Environment Audit
  const missingEnv = [];
  if (!process.env.MONGODB_URI) missingEnv.push("MONGODB_URI");
  if (!process.env.EMAIL_USER) missingEnv.push("EMAIL_USER");
  if (!process.env.EMAIL_PASS) missingEnv.push("EMAIL_PASS");
  if (!process.env.GEMINI_API_KEY) missingEnv.push("GEMINI_API_KEY");

  const envDiagnostics = missingEnv.length > 0 
    ? `Critical Configuration Missing: ${missingEnv.join(", ")}. Please check your Vercel Dashboard environment variables.`
    : null;

  // Ensure CORS headers are present even in failure states
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  
  res.status(500).json({ 
    message: "Internal Operational Failure. Transaction aborted.",
    systemDetail: envDiagnostics || err.message || 'Access backend logs for diagnostic traces.'
  });
});

export default app;
