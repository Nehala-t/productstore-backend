import HttpError from '../utils/HttpError.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


export const userRegister = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;


        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return next(new HttpError('Email already exists', 400));
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstName,
            lastName,
            email: normalizedEmail,
            password: hashedPassword,
            role, // 🔐 force default role
        });

        await newUser.save();

        const token = jwt.sign(
            {
                user_id: newUser._id,
                role: newUser.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_TOKEN_EXPIRY }
        );

        // Store JWT in cookie 
        res.cookie("accessToken", token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production", 
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", maxAge: 24 * 60 * 60 * 1000, 
        });

        // Store role in cookie 
        res.cookie("role", newUser.role, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production", 
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", maxAge: 24 * 60 * 60 * 1000, 
        });

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                email: newUser.email,
                role: newUser.role,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
            },
            accessToken: token,
        });
    } catch (error) {
        return next(
            new HttpError(error.message || 'Internal Server Error', 500)
        );
    }
};


// user login
export const userLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return next(new HttpError('Email and password are required', 400));
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: normalizedEmail }).select(
            '_id firstName lastName email role password'
        );
        console.log('ALL USERS IN DATABASE:', user);

        // Generic error (security best practice)
        if (!user) {
            console.log(`❌ User not found with email: ${normalizedEmail}`);
            return next(new HttpError('Invalid email or password', 401));
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Bcrypt Match Result:', isMatch);

        if (!isMatch) {
            console.log('❌ Password mismatch');
            return next(new HttpError('Invalid email or password', 401));
        }


        // Create JWT
        const token = jwt.sign(
            {
                user_id: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_TOKEN_EXPIRY }
        );

        // Store JWT in cookie 
        res.cookie("accessToken", token, { 
            httpOnly: false, 
            secure: process.env.NODE_ENV === "production", 
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", maxAge: 24 * 60 * 60 * 1000, 
        });

        // Store role in cookie 
        res.cookie("role", user.role, { 
            httpOnly: false, 
            secure: process.env.NODE_ENV === "production", 
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", maxAge: 24 * 60 * 60 * 1000, 
        });

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            accessToken: token,
        });
    } catch (error) {
        return next(
            new HttpError(error.message || 'Internal Server Error', 500)
        );
    }
};


export const updateDefaultAddress = async (req, res, next) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Only users can update address",
      });
    }

    const userId = req.user.user_id;

    const {
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      pincode,
    } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        defaultAddress: {
          firstName,
          lastName,
          phone,
          address,
          city,
          state,
          pincode,
        },
      },
      {
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      data: user.defaultAddress,
    });
  } catch (error) {
    console.error(
      "Update default address error:",
      error
    );

    next(error);
  }
};

export const getDefaultAddress = async (
  req,
  res,
  next
) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Only users can view address",
      });
    }

    const user = await User.findById(
      req.user.user_id
    ).select("defaultAddress");

    return res.status(200).json({
      success: true,
      message: "Default address fetched successfully",
      data: user?.defaultAddress || null,
    });
  } catch (error) {
    console.error(
      "Get default address error:",
      error
    );

    next(error);
  }
};
