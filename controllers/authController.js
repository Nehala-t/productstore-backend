import HttpError from '../utils/HttpError.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


export const userRegister = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;
        // Basic validation
        // if (!firstName || !lastName || !email || !password) {
        //   return next(new HttpError("All fields are required", 400));
        // }

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

        console.log('Found User Stored Hash:', user.password);
        console.log('Plaintext Password Entered:', password);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Bcrypt Match Result:', isMatch);

        if (!isMatch) {
            console.log('❌ Password mismatch');
            return next(new HttpError('Invalid email or password', 401));
        }

        const token = jwt.sign(
            {
                user_id: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_TOKEN_EXPIRY }
        );

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
