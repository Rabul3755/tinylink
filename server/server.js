import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

import { initDB } from "./config/database.js";
import linksRouter from "./routes/links.js";
import { getLinkByCode, incrementClicks } from "./models/link.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Trust Render/Vercel proxy (IMPORTANT)
app.set("trust proxy", 1);

// Security middleware
app.use(helmet());

// CORS settings (allow your frontend)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      process.env.CLIENT_URL, // Your Vercel URL from .env
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

// API Routes
app.use("/api/links", linksRouter);

// Health check
app.get("/healthz", (req, res) => {
  res.status(200).json({
    ok: true,
    version: "1.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Test DB route
app.get("/test-db", async (req, res) => {
  try {
    const testLink = await getLinkByCode("test");
    res.json({
      success: true,
      message: "Database connection successful",
      testResult: testLink || "No test link found",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Database connection failed",
      details: err.message,
    });
  }
});

// Redirect handler
app.get("/:code", async (req, res) => {
  try {
    const { code } = req.params;

    // Skip invalid paths
    if (
      code.includes(".") ||
      code === "healthz" ||
      code === "api" ||
      code === "test-db" ||
      code.startsWith("_") ||
      code === "favicon.ico"
    ) {
      return res.status(404).json({ error: "Not found" });
    }

    const link = await getLinkByCode(code);

    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    await incrementClicks(code);

    return res.redirect(302, link.original_url);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// 💡 IMPORTANT: NO frontend serving here
// (Frontend is deployed separately on Vercel)

// Start server + DB
const startServer = async () => {
  try {
    await initDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

startServer();

export default app;
