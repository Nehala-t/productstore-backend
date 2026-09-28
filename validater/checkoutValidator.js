import { body } from "express-validator";

export const checkoutValidator = [
  body("shippingAddress")
    .notEmpty()
    .withMessage("Shipping address is required"),

  body("shippingAddress.firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),

  body("shippingAddress.lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name must be between 1 and 50 characters"),

  body("shippingAddress.phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Enter a valid 10-digit phone number"),

  body("shippingAddress.address")
    .trim()
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Address must be between 5 and 200 characters"),

  body("shippingAddress.city")
    .trim()
    .notEmpty()
    .withMessage("City is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2 and 50 characters"),

  body("shippingAddress.state")
    .trim()
    .notEmpty()
    .withMessage("State is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("State must be between 2 and 50 characters"),

  body("shippingAddress.pincode")
    .trim()
    .notEmpty()
    .withMessage("Pincode is required")
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage("Enter a valid 6-digit pincode"),

  body("paymentMethod")
    .optional()
    .isIn(["COD", "ONLINE"])
    .withMessage("Payment method must be COD or ONLINE"),
];