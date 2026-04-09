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
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// --- Multi-Tenant CORS Strategy ---
// We allow the local development studio and the designated production frontend origin.
const allowedOrigins = [
  "http://localhost:5173",
  "https://planora-smart-event-os-web.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Cross-Origin Access Restricted by Planora Security Protocol'));
    }
  },
  credentials: true
}));

app.use(express.json());

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

// Static files for uploads (prefixed with /api to match VITE_API_URL expectations)
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Planora backend running 🚀" });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Only listen if not in a serverless environment
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`✅ Planora backend running at http://localhost:${PORT}`);
  });
}

// Global Error Handler - Operational Integrity
app.use((err, req, res, next) => {
  console.error(`[Operational Failure] ${err.stack}`);
  
  // Ensure CORS headers are present even in failure states
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  
  res.status(500).json({ 
    message: "Internal Operational Failure. Transaction aborted.",
    systemDetail: process.env.NODE_ENV === 'production' ? 'Access backend logs for diagnostic traces.' : err.message
  });
});

export default app;
