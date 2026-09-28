import express from "express";
import { ViewWishList, AddWishList, RemoveWishlist, ClearWishlist } from "../controllers/wishListController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/viewWishList", authMiddleware, ViewWishList);
router.post("/addWishList", authMiddleware, AddWishList);
router.delete(
  "/removeWishList/:productId",
  authMiddleware,
  RemoveWishlist
);router.delete("/clearWishList", authMiddleware, ClearWishlist);

0

export default router;