import Cart from "../models/Cart.js";



export const viewCart = async (req, res, next) => {
  try {
   
    const userId = req.user.user_id;

    console.log("VIEW CART USER ID:", userId);

    const allCartItems = await Cart.find({
      userId: userId,
    });

    console.log("ALL CART ITEMS:", allCartItems);

    const cartItems = await Cart.find({
      userId: userId,
      isDeleted: false,
    }).populate("productId");

    console.log("ACTIVE CART ITEMS:", cartItems);

    res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      data: cartItems,
    });
  } catch (error) {
    next(error);
  }
};


export const addCart = async (req, res, next) => {
  try {
    // Check authenticated user
    if (!req.user || !req.user.user_id) {
      return next(new HttpError("Unauthorized user", 401));
    }
    
    const userId = req.user.user_id;

    const {
      productId,
      quantity = 1,
      action = "set",
    } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const existingCart = await Cart.findOne({
      userId,
      productId,
    });

    // Product was previously removed/cleared
    if (existingCart && existingCart.isDeleted === true) {
      existingCart.quantity = quantity;
      existingCart.isDeleted = false;

      await existingCart.save();

      return res.status(200).json({
        success: true,
        message: "Product added to cart",
        data: existingCart,
      });
    }

    // Product page → Add Cart
    if (existingCart && action === "add") {
      existingCart.quantity += quantity;
      existingCart.isDeleted = false;

      await existingCart.save();

      return res.status(200).json({
        success: true,
        message: "Product quantity increased",
        data: existingCart,
      });
    }

    // Cart page → + / -
    if (existingCart) {
      existingCart.quantity = quantity;
      existingCart.isDeleted = false;

      await existingCart.save();

      return res.status(200).json({
        success: true,
        message: "Cart quantity updated",
        data: existingCart,
      });
    }

    // New cart item
    const cart = await Cart.create({
      userId,
      productId,
      quantity,
      isDeleted: false,
    });

    return res.status(201).json({
      success: true,
      message: "Product added to cart",
      data: cart,
    });

  } catch (error) {
    next(error);
  }
};

export const removeCart = async (req, res, next) => {
  try {
    // Check authenticated user
    if (!req.user || !req.user.user_id) {
      return next(new HttpError("Unauthorized user", 401));
    }

    const userId = req.user.user_id;
    const role = req.user.role;
    const { productId } = req.params;

    console.log("REMOVE USER ID:", userId);
    console.log("REMOVE PRODUCT ID:", productId);

    // Only normal users can remove products from their cart
    if (role !== "user") {
      return next(
        new HttpError("Only users can remove products from cart", 403)
      );
    }

    // Find user's active cart item
    const cartItem = await Cart.findOne({
      userId: userId,
      productId: productId,
      isDeleted: false,
    });

    if (!cartItem) {
      return next(
        new HttpError("Product not found in cart", 404)
      );
    }

    // Check ownership
    if (cartItem.userId.toString() !== userId.toString()) {
      return next(
        new HttpError(
          "You are not authorized to remove this product from cart",
          403
        )
      );
    }

    // Soft delete
    cartItem.isDeleted = true;

    await cartItem.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      data: cartItem,
    });
  } catch (error) {
    return next(error);
  }
};



export const clearCart = async (req, res, next) => {
  try {
    // Check authenticated user
    if (!req.user || !req.user.user_id) {
      return next(new HttpError("Unauthorized user", 401));
    }

    const userId = req.user.user_id;
    const role = req.user.role;

    // Only normal users can clear their cart
    if (role !== "user") {
      return next(
        new HttpError("Only users can clear the cart", 403)
      );
    }

    console.log("CLEAR CART USER ID:", userId);

    const result = await Cart.updateMany(
      {
        userId: userId,
        isDeleted: false,
      },
      {
        $set: {
          isDeleted: true,
        },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart is already empty",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    return next(error);
  }
};