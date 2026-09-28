import express from "express";
import authRoutes from "./routes/authRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import cartRoutes from "./routes/cartRoutes.js"
import wishListRoutes from "./routes/wishListRoutes.js"
import checkoutRoutes from "./routes/checkoutRoutes.js"
import cors from "cors";
import path from "path"
import connectDB from "./config/ConnectDb.js";
import dotenv from 'dotenv'
import cookieParser from "cookie-parser";


dotenv.config()


const app = express();

const PORT = 5000;

// Middleware
app.use(express.json());

app.use(cookieParser());

// Enable CORS to allow requests from different origins
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Serve uploaded images
app.use("/upload", express.static(path.join(process.cwd(), "upload")));

// Connect MongoDB
connectDB()



// Auth routes
app.use("/api/users", authRoutes);


// Product routes

app.use("/api", productRoutes);

// Cart routes
app.use("/api",cartRoutes);

// Wish list  routes
app.use("/api/wishlist",wishListRoutes);

// Checout  routes
app.use("/api/checkout",checkoutRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

