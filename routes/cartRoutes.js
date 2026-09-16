import express from "express";
import { viewCart, addCart, removeCart, clearCart} from '../controllers/cartController.js'
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/viewCart", authMiddleware, viewCart);
router.post("/addCart",authMiddleware, addCart);
router.delete("/removeCart/:productId", authMiddleware, removeCart);
router.delete("/clearCart", authMiddleware, clearCart);
0

export default router;