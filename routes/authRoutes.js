import express from "express";
import { userRegister, userLogin, getDefaultAddress, updateDefaultAddress } from "../controllers/authController.js";
import { registerValidation, loginValidation } from "../validater/authValidater.js";
import { validate } from "../middleware/validater.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerValidation,validate, userRegister);
router.post("/login", loginValidation, validate, userLogin);
router.get(
  "/defaultAddress",
  authMiddleware,
  getDefaultAddress
);

router.put(
  "/defaultAddress",
  authMiddleware,
  updateDefaultAddress
);



export default router;