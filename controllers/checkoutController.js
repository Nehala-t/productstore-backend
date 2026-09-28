import Checkout from "../models/Checkout.js"
import Cart from "../models/Cart.js";

export const ViewCheckout = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const checkout = await Checkout.find({
      userId,
    })
      .populate("products.productId")
      .sort({ createdAt: -1 });

    if (!checkout || checkout.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No checkout records found",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Checkout details fetched successfully",
      data: checkout,
    });
  } catch (error) {
    console.error("View checkout error:", error);
    next(error);
  }
};


export const CreateCheckout = async (req, res, next) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Only users can place orders",
      });
    }

    const userId = req.user.user_id;

    const {
      shippingAddress,
      paymentMethod = "COD",
    } = req.body;

    // Get all active cart products for this user
    const cartItems = await Cart.find({
      userId,
      isDeleted: false,
    }).populate("productId");

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    // Create checkout product list
    const checkoutProducts = cartItems.map((item) => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.productId.price,
    }));

    // Calculate total
    const totalAmount = checkoutProducts.reduce(
      (total, item) => {
        return total + item.price * item.quantity;
      },
      0
    );

    // Create checkout
    const checkout = new Checkout({
      userId,
      products: checkoutProducts,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "pending",
    });

    await checkout.save();

    // Soft delete cart items
    await Cart.updateMany(
      {
        userId,
        isDeleted: false,
      },
      {
        $set: {
          isDeleted: true,
        },
      }
    );

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: checkout,
    });
  } catch (error) {
    console.error("Create checkout error:", error);
    next(error);
  }
};



export const updateOrderStatus = async (req, res, next) => {
  try {
    if (req.user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Only sellers can update order status",
      });
    }

    const { orderId } = req.params;
    const { productId, orderStatus } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!productId || !orderStatus) {
      return res.status(400).json({
        success: false,
        message: "Product ID and order status are required",
      });
    }

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Checkout.findById(orderId).populate(
      "products.productId"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const sellerId = req.user.user_id;

    const orderProduct = order.products.find(
      (item) =>
        item.productId &&
        item.productId._id.toString() === productId.toString()
    );

    if (!orderProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found in this order",
      });
    }

    // Check seller owns this product
    if (
      orderProduct.productId.sellerId.toString() !==
      sellerId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this product order",
      });
    }

    // Update status in MongoDB
    orderProduct.orderStatus = orderStatus;

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order ${orderStatus} successfully`,
      data: order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    next(error);
  }
};


export const cancelOrder = async (req, res, next) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Only customers can cancel orders",
      });
    }

    const order = await Checkout.findOne({
      _id: req.params.orderId,
      userId: req.user.user_id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if all products can be cancelled
    const cannotCancel = order.products.some((item) =>
      ["shipped", "delivered", "cancelled"].includes(
        item.orderStatus
      )
    );

    if (cannotCancel) {
      return res.status(400).json({
        success: false,
        message: "One or more products cannot be cancelled",
      });
    }

    // Cancel every product in this order
    order.products.forEach((item) => {
      item.orderStatus = "cancelled";
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    next(error);
  }
};



export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.user_id;

    const orders = await Checkout.find()
      .populate("userId", "firstName lastName email")
      .populate(
        "products.productId",
        "title price image category sellerId"
      )
      .sort({ createdAt: -1 });

    // Keep only products belonging to the logged-in seller
    const sellerOrders = orders
      .map((order) => {
        const sellerProducts = order.products.filter(
          (item) =>
            item.productId &&
            item.productId.sellerId &&
            item.productId.sellerId.toString() === sellerId.toString()
        );

        if (sellerProducts.length === 0) {
          return null;
        }

        return {
          _id: order._id,

          userId: order.userId,

          products: sellerProducts,

          shippingAddress: order.shippingAddress,

          paymentMethod: order.paymentMethod,

          paymentStatus: order.paymentStatus,

          createdAt: order.createdAt,

          updatedAt: order.updatedAt,

          // Total only for this seller's products
          totalAmount: sellerProducts.reduce(
            (total, item) =>
              total +
              Number(item.price) * Number(item.quantity),
            0
          ),
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      message: "Seller orders fetched successfully",
      data: sellerOrders,
    });
  } catch (error) {
    console.error("getSellerOrders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch seller orders",
      error: error.message,
    });
  }
};