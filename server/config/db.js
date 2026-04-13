import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    mongoose.set('debug', true);

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`DB ERROR: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

console.log("ENV CHECK:", process.env.MONGO_URI);