import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
console.log("Mongo URI:", process.env.mongodbURI);

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.mongodbURI);

    console.log("MongoDB connected successfully!");
    console.log("Database:", mongoose.connection.name);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default dbConnect;