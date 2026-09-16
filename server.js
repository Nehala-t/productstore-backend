import express from "express";
import authRoutes from "./routes/authRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import cartRoutes from "./routes/cartRoutes.js"
import cors from "cors";
import path from "path"
import connectDB from "./config/ConnectDb.js";
import dotenv from 'dotenv'


dotenv.config()


const app = express();

const PORT = 5000;

// Middleware
app.use(express.json());

// Enable CORS to allow requests from different origins
app.use(cors());

// Serve uploaded images
app.use("/upload", express.static(path.join(process.cwd(), "upload")));

// Connect MongoDB
connectDB()



// Auth routes
app.use("/api/users", authRoutes);


// Product routes

app.use("/api", productRoutes);

// Product routes
app.use("/api",cartRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// import dotenv from 'dotenv'
// import cors from 'cors'
// import express from 'express'
// import { ConnectDB }  from './config/ConnectDb.js'
// import routes from './routes/authRoutes.js'
// import authMiddleware from './middleware/authMiddleware.js'


// //load .env variable
// dotenv.config()


// //port define,express call
// const PORT = process.env.PORT || 3000
// const app = express()

// //connect to mongodbe
// ConnectDB();

// //middleware
// app.use(express.json());
// app.use(cors());

// app.use("/api/users",routes);

// app.use(authMiddleware);

// //start server
// app.listen(PORT,() => console.log(`server running on http://localhost:${PORT}`))