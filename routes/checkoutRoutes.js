import express from "express";
import { ViewCheckout, CreateCheckout,updateOrderStatus, cancelOrder, getSellerOrders} from '../controllers/checkoutController.js'
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkoutValidator } from "../validater/checkoutValidator.js";
import { validate } from "../middleware/validater.js"

const router = express.Router();

router.post(
  "/createCheckout",
  authMiddleware,
  checkoutValidator,
  validate,
  CreateCheckout
);
router.get("/viewCheckout", authMiddleware, ViewCheckout);
router.patch(
  "/updateOrderStatus/:orderId",
  authMiddleware,
  updateOrderStatus
);

router.patch(
  "/cancelOrder/:orderId",
  authMiddleware,
  cancelOrder
);

router.get(
  "/sellerOrders",
  authMiddleware,
  getSellerOrders
);

export default router;