import mongoose from "mongoose";

// Initialize a single MongoDB connection for the application lifecycle.
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};
export default connectDB;
