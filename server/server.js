import dotenv from "dotenv";
dotenv.config();

console.log("ENV CHECK:", process.env.MONGO_URI);
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoose from 'mongoose';
import crypto from 'crypto';
import connectDB from './config/db.js';
import User from './models/User.js';
import Session from './models/Session.js';
import { config } from './config/env.js';
import logger from './utils/logger.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import SchedulerService from './services/SchedulerService.js';

const app = express();
// FIRST (correct)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://localindustryconnect.vercel.app",
    ],
    credentials: true,
  })
);

app.disable('x-powered-by');

// Connect to MongoDB
connectDB();

// Initialize Cron Jobs
SchedulerService.start();

// Middleware Core
app.use(helmet());
app.use(express.json());

// Trace Middleware
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  req.startTime = Date.now();
  req.logger = logger.child({ reqId: req.id });
  res.on('finish', () => {
    const durationMs = Date.now() - req.startTime;
    req.logger.info(`[Audit Trace]`, {
      requestId: req.id,
      route: `${req.method} ${req.originalUrl}`,
      status: res.statusCode < 400 ? 'success' : 'failure',
      statusCode: res.statusCode,
      durationMs
    });
  });
  next();
});

// Rate Limiting
// Disable rate limit in development
if (process.env.NODE_ENV === "production") {
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
    })
  );
}

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Test Route
app.get("/api/test", (req, res) => {
  res.json({ message: "Server running" });
});
app.get('/api/test', (req, res) => {
  res.status(200).end();
});

app.get("/api/ping", (req, res) => {
  res.status(200).json({ message: "pong" });
});

app.head("/api/ping", (req, res) => {
  res.status(200).end();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/health', (req, res) => res.status(200).json({ status: 'ready', timestamp: new Date() }));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Database connection log is handled inside connectDB()
});
