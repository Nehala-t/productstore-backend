import mongoose from "mongoose";
import WishList from "../models/WishList.js";

// =========================
// VIEW WISHLIST
// =========================

export const ViewWishList = async (req, res, next) => {
  try {
    // Only normal users can access wishlist
    if (req.user.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Only users can access wishlist",
      });
    }

    const userId = req.user.user_id;

    const wishlist = await WishList.findOne({
      userId,
    }).populate("products.productId");

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        message: "Wishlist fetched successfully",
        data: [
          {
            products: [],
          },
        ],
      });
    }

    // Get only active products
    const activeProducts = wishlist.products
      .filter(
        (item) =>
          !item.isDeleted &&
          item.productId
      )
      .map((item) => item.productId);

    return res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      data: [
        {
          _id: wishlist._id,
          userId: wishlist.userId,
          products: activeProducts,
        },
      ],
    });

  } catch (error) {
    console.error("View wishlist error:", error);
    next(error);
  }
};

// =========================
// ADD / TOGGLE WISHLIST
// =========================
export const AddWishList = async (req, res, next) => {
  try {
    // Only normal users can use wishlist
    if (req.user.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Only users can use wishlist",
      });
    }

    const userId = req.user.user_id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    let wishlist = await WishList.findOne({
      userId,
    });

    // =========================
    // NO WISHLIST EXISTS
    // =========================
    if (!wishlist) {
      wishlist = new WishList({
        userId,
        products: [
          {
            productId,
            isDeleted: false,
          },
        ],
      });

      await wishlist.save();

      return res.status(201).json({
        success: true,
        message: "Product added to wishlist",
        action: "added",
        data: wishlist,
      });
    }

    // =========================
    // CHECK EXISTING PRODUCT
    // =========================
    const existingProduct = wishlist.products.find(
      (item) =>
        item.productId &&
        item.productId.toString() === productId.toString()
    );

    // =========================
    // PRODUCT EXISTS
    // =========================
    if (existingProduct) {

      // =========================
      // SOFT DELETED → RESTORE
      // =========================
      if (existingProduct.isDeleted) {
        existingProduct.isDeleted = false;

        await wishlist.save();

        return res.status(200).json({
          success: true,
          message: "Product added back to wishlist",
          action: "added",
          data: wishlist,
        });
      }

      // =========================
      // ACTIVE → SOFT DELETE
      // =========================
      existingProduct.isDeleted = true;

      await wishlist.save();

      return res.status(200).json({
        success: true,
        message: "Product removed from wishlist",
        action: "removed",
        data: wishlist,
      });
    }

    // =========================
    // NEW PRODUCT
    // =========================
    wishlist.products.push({
      productId,
      isDeleted: false,
    });

    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      action: "added",
      data: wishlist,
    });

  } catch (error) {
    console.error("Add wishlist error:", error);
    next(error);
  }
};


// =========================
// REMOVE WISHLIST
// SOFT DELETE
// =========================
export const RemoveWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const wishlist = await WishList.findOne({
      userId: req.user.user_id,
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    const item = wishlist.products.find(
      (item) =>
        item.productId &&
        item.productId.toString() === productId &&
        !item.isDeleted
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    // =========================
    // SOFT DELETE
    // =========================
    item.isDeleted = true;

    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      action: "removed",
    });
  } catch (error) {
    console.error("Remove wishlist error:", error);
    next(error);
  }
};


// =========================
// CLEAR WISHLIST
// SOFT DELETE ALL
// =========================
export const ClearWishlist = async (req, res, next) => {
  try {
    const wishlist = await WishList.findOne({
      userId: req.user.user_id,
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    // Soft delete every product
    wishlist.products.forEach((item) => {
      item.isDeleted = true;
    });

    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
      action: "cleared",
    });
  } catch (error) {
    console.error("Clear wishlist error:", error);
    next(error);
  }
};