import jwt from "jsonwebtoken";
import HttpError from "../utils/HttpError.js";

export const authMiddleware = (req, res, next) => {
  try {
    // 1. First try to get token from cookie
    let token = req.cookies.accessToken;

    console.log("Cookie token:", token);

    // 2. If cookie doesn't exist, check Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;

      console.log("Authorization header:", authHeader);

      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    // 3. No token found
    if (!token) {
      return next(
        new HttpError("Access token is required", 401)
      );
    }

    // 4. Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // 5. Store decoded user information
    req.user = decoded;

    console.log("Authenticated user:", req.user);

    next();

  } catch (error) {
    console.log("Auth error:", error.message);

    return next(
      new HttpError("Invalid or expired token", 401)
    );
  }
};