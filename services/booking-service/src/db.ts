import mongoose from "mongoose";

export async function connectDb(): Promise<void> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("MONGODB_URI is required for booking-service");
  }
  await mongoose.connect(uri);
}
