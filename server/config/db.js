import mongoose from 'mongoose';
import { config } from './env.js';

const connectDB = async () => {
  try {
    mongoose.set('debug', config.nodeEnv === 'development');

    if (!config.db) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    const conn = await mongoose.connect(config.db);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`DB ERROR: ${error.message}`);
    // In development, keep the server running even if DB is unavailable.
    if (config.nodeEnv === 'production') {
      process.exit(1);
    } else {
      console.warn('DB connection failed; continuing without DB in development.');
    }
  }
};

export default connectDB;
