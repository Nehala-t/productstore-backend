import { body } from "express-validator";

export const productValidation = [
  // Title
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required"),

  // Description
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 50, max: 500 })
    .withMessage(
      "Description must be between 50 and 500 characters"
    ),

  // Price
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isNumeric()
    .withMessage("Price must be a number")
    .isFloat({ gt: 0 })
    .withMessage("Price must be greater than 0"),

  // Category
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required"),
];