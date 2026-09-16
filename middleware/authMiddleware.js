import jwt from "jsonwebtoken";
import HttpError from "../utils/HttpError.js";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("token:",authHeader);

    

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new HttpError("Access token is required", 401));
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (error) {
    return next(new HttpError("Invalid or expired token", 401));
  }
};