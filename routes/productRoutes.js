import express from "express";
import { AddProduct, AllProduct,ViewProduct, viewSellerProducts, update, deleteProduct } from "../controllers/productController.js";
import { productValidation } from "../validater/productValidater.js";
import {validate}  from "../middleware/validater.js";
import upload from "../middleware/uploadMiddlware.js"
import { authMiddleware } from "../middleware/authMiddleware.js"


const router = express.Router();

router.post("/AddProducts", authMiddleware, upload.single("image"),  productValidation, validate, AddProduct);
router.get("/AllProducts", authMiddleware, AllProduct);
router.get("/ViewProduct", ViewProduct);
router.get("/viewSellerProducts", authMiddleware, viewSellerProducts);
router.post("/update" ,authMiddleware, upload.single("image"), productValidation, validate, update);
router.delete(
  "/deleteProduct/:id",
  authMiddleware,
  deleteProduct
);

export default router;