import Cart from "../models/Cart.js";
import HttpError from "../utils/HttpError.js";
import Product from '../models/Product.js'


export const AllProduct = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    // Search
    const searchTerm = req.query.search?.trim() || "";

    const filter = {};

    if (searchTerm) {
      const searchConditions = [
        {
          title: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          category: {
            $regex: searchTerm,
            $options: "i",
          },
        },
      ];

      // Search by price if search value is a number
      const price = Number(searchTerm);

      if (!isNaN(price)) {
        searchConditions.push({
          price: price,
        });
      }

      filter.$or = searchConditions;
    }

    // Seller should NOT see their own products
    if (req.user?.role === "seller") {
      filter.sellerId = {
        $ne: req.user.user_id,
      };
    }

    // Total matching products
    const totalProducts = await Product.countDocuments(filter);

    // Get products
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Total pages
    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    return next(error);
  }
};


export const AddProduct = async (req, res, next) => {
  try {

    // Check authenticated user
    if (!req.user || !req.user.user_id) {
      return next(new HttpError("Unauthorized user", 401));
    }

    const role = req.user.role;
    console.log("role====>",role);
    const id = req.user.user_id;

    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    // Only seller can add product
    if (role !== "seller") {
      return next(new HttpError("Only sellers can add products", 403));
    }


    const {
      title,
      description,
      price,
      category,
    } = req.body;

     if (!req.file) {
      return next(new HttpError("Image file is required", 400));
    }

    // Save browser-accessible path
    const image = `/upload/${req.file.filename}`;
    console.log("Saved image path:", image);

    // Validate required fields
    // if (!title || !description || price === undefined || !image ) {
    //   return next(new HttpError("Required fields are missing", 400));
    // }

     

    // Create product
    const newProduct = new Product({
      sellerId : id,
      title,
      description,
      price,
      image,
      category,
    });

    // Save to MongoDB
    await newProduct.save();

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: newProduct,
    });
  } catch (error) {
    return next(error);
  }
};


export const ViewProduct = async (req, res, next) => {
  try {
    const id = req.originalUrl.split("?")[1];

    console.log("id=====", id);

    const product = await Product.findById(id);

    if (!product) {
      return next(new HttpError("Product not found", 404));
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    return next(error);
  }
};


export const viewSellerProducts = async (req, res, next) => {
  try{
   
    // Get only this seller's products
    const sellerId = req.user.user_id; 
    console.log("sellerId====>", sellerId);
    const products = await Product.find({ sellerId});
    return res.status(200).json({
      success: true,
      message: "Seller products fetched successfully",
      data: products,
    });

  }
  catch (error) {
    return next(error);
  }
}


export const update = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const role = req.user.role;

    console.log("PRODUCT ID:", id);
    console.log("USER ID:", userId);
    console.log("ROLE:", role);

    // Only sellers can update products
    if (role !== "seller") {
      return next(
        new HttpError("Only sellers can update products", 403)
      );
    }

    // Find the product first
    const product = await Product.findById(id);
    if (!product) {
      return next(
        new HttpError("Product not found", 404)
      );
    }

        console.log("PRODUCT SELLER ID:", product.sellerId);


    if (product.sellerId.toString() !== userId.toString()) {
  return next(
    new HttpError(
      "You are not authorized to update this product",
      403
    )
  );
    }


    const updateData = {
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
    };

    // If a new image was selected
    if (req.file) {
      updateData.image = `/upload/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    return next(error);
  }
};


export const deleteProduct = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const role = req.user.role;
    const { id } = req.params;

    // Only seller can delete products
    if (role !== "seller") {
      return next(
        new HttpError("Only sellers can delete products", 403)
      );
    }

    // Find the product first
    const product = await Product.findById(id);

    if (!product) {
      return next(
        new HttpError("Product not found", 404)
      );
    }

    // Check whether this product belongs to logged-in seller
    if (product.sellerId.toString() !== userId.toString()) {
      return next(
        new HttpError(
          "You are not authorized to delete this product",
          403
        )
      );
    }

    // Delete only if it belongs to this seller
    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });

  } catch (error) {
    return next(error);
  }
};
