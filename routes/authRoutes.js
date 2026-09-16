import express from "express";
import { userRegister, userLogin } from "../controllers/authController.js";
import { AddProduct } from "../controllers/productController.js";
import { registerValidation, loginValidation } from "../validater/authValidater.js";
import { validate } from "../middleware/validater.js";

const router = express.Router();

router.post("/register", registerValidation,validate, userRegister);
router.post("/login", loginValidation, validate, userLogin);
// router.post("/logout", userLogout);

0

export default router;