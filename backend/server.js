import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./utils/db.js";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import http from "http";
import { Server as SocketIO } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Cleanup jobs
import { deactivateExpiredPremiums } from "./utils/premiumCleanup.js";
import { deactivateExpiredSubscriptions } from "./utils/deactivateExpiredSubscriptions.js";
import cleanupUnusedImages from "./utils/cleanupUnusedImages.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import tempRoutes from "./routes/tempRoutes.js";
import referralRoutes from "./routes/referralRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import configRoutes from "./routes/configRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import premiumPlanRoutes from "./routes/premiumPlanRoutes.js";
import networkRoutes from "./routes/networkAddressesRoutes.js";
import commissionNotificationRoutes from "./routes/commissionNotificationRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import helpCenterRoutes from "./routes/helpCenterRoutes.js";

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve uploads statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Setup allowed origins array from both admin and user frontend URLs
const allowedOrigins = [
  process.env.FRONTEND_URL_ADMIN,
  process.env.FRONTEND_URL_USER,
].filter(Boolean);

// CORS middleware with error handling
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Allow Postman, curl, etc.

      console.log("🌐 Incoming request origin:", origin);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn(`Blocked CORS request from origin: ${origin}`);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// JSON parsing with bad JSON error detection
app.use(
  express.json({
    strict: true,
    verify: (req, res, buf) => {
      try {
        JSON.parse(buf);
      } catch {
        throw new Error("Bad JSON");
      }
    },
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/temp", tempRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/products", productRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/commission-notifications", commissionNotificationRoutes);
app.use("/api/addresses", networkRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/help-center", helpCenterRoutes);

// Admin routes
app.use("/api/premium", premiumPlanRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/config", configRoutes);
app.use("/api/admin", adminRoutes);

// Catch-all 404 for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Global error handler
app.use((err, req, res, next) => {
  if (err.message === "Bad JSON") {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "CORS Error: Access Denied" });
  }

  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Cron jobs (only in production)
if (process.env.NODE_ENV === "production") {
  cron.schedule("0 0 * * *", async () => {
    console.log("⏳ Running daily cleanup jobs...");
    try {
      await deactivateExpiredPremiums();
      await deactivateExpiredSubscriptions();
      await cleanupUnusedImages();
      console.log("✅ Cleanup jobs completed.");
    } catch (error) {
      console.error("❌ Cleanup jobs error:", error);
    }
  });
}

// Create HTTP + Socket.IO server
const server = http.createServer(app);

// Setup Socket.IO allowed origins same as HTTP allowedOrigins
const socketAllowedOrigins = allowedOrigins;
const io = new SocketIO(server, {
  cors: {
    origin: (origin, callback) => {
      console.log("Socket.IO origin:", origin);
      if (!origin) return callback(null, true);
      if (socketAllowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`Socket.IO CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});



app.set("io", io);

io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 5030;
const DOMAIN = process.env.DOMAIN || "http://localhost";

server.listen(PORT, () => {
  console.log(`🚀 Server running at ${DOMAIN}:${PORT}`);
});
