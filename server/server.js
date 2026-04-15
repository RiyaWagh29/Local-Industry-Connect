import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import crypto from "crypto";
import path from "path";

import connectDB from "./config/db.js";
import { config } from "./config/env.js";
import logger from "./utils/logger.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import communityMessageRoutes from "./routes/communityMessageRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import SchedulerService from "./services/SchedulerService.js";

const app = express();

const corsOptions = {
  origin(origin, callback) {
    if (!origin || config.corsOrigins.length === 0 || config.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.disable("x-powered-by");
app.use("/uploads", express.static(path.resolve("server", "uploads")));

app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  req.startTime = Date.now();
  req.logger = logger.child({ reqId: req.id });

  res.on("finish", () => {
    const durationMs = Date.now() - req.startTime;
    req.logger.info("[Audit Trace]", {
      requestId: req.id,
      route: `${req.method} ${req.originalUrl}`,
      status: res.statusCode < 400 ? "success" : "failure",
      statusCode: res.statusCode,
      durationMs,
    });
  });

  next();
});

if (config.nodeEnv === "production") {
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 500,
    })
  );
}

if (config.nodeEnv === "development") {
  app.use(morgan("dev"));
}

connectDB();
SchedulerService.start();

app.get("/api/test", (req, res) => {
  res.json({ message: "Server running" });
});

app.get("/api/ping", (req, res) => {
  res.status(200).json({ message: "pong" });
});

app.head("/api/ping", (req, res) => {
  res.status(200).end();
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/community-messages", communityMessageRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);

app.get("/health", (req, res) =>
  res.status(200).json({ status: "ready", timestamp: new Date() })
);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "API server is live",
  });
});

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
