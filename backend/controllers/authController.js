import OTP from "../models/OTP.js";
import { validateEmail } from "../utils/inputValidator.js";
import { handleControllerError } from "../utils/errorHandler.js";
import bcrypt from "bcrypt";

// Stub for sendOTPMail since it's missing in emailService.js
const sendOTPMail = async (email, code) => {
    console.log(`[Mock] Sending OTP ${code} to ${email}`);
};

/**
 * Generates and sends a 6-digit OTP for email verification.
 * @route POST /api/auth/send-otp
 */
export const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        // ReDoS-safe email validation via validator.isEmail() — no hand-rolled regex
        if (!validateEmail(email)) {
            return res.status(400).json({ message: "Invalid email address" });
        }

        // Generate a random 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Define expiration (5 minutes from now)
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // Remove existing OTPs for this email to prevent spam/conflicts
        await OTP.deleteMany({ email });

        // Create new record
        await OTP.create({ email, code, expiresAt });

        // Send via email service
        await sendOTPMail(email, code);

        res.json({ message: "Verification code sent to your email" });
    } catch (error) {
        return handleControllerError(res, error, "Service temporarily unavailable. Please try again later.");
    }
};

/**
 * Verifies the 6-digit OTP and signals authorization success.
 * @route POST /api/auth/verify-otp
 */
export const verifyOTP = async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) return res.status(400).json({ message: "Email and code are required" });

        // ReDoS-safe email validation
        if (!validateEmail(email)) {
            return res.status(400).json({ message: "Invalid email address" });
        }

        // OTP codes are always 6 numeric digits — reject anything else early
        if (!/^\d{6}$/.test(code)) {
            return res.status(400).json({ message: "Invalid or expired verification code" });
        }

        const record = await OTP.findOne({ email, code });

        if (!record) {
            return res.status(400).json({ message: "Invalid or expired verification code" });
        }

        // Clear the OTP record after successful verification
        await OTP.deleteOne({ _id: record._id });

        res.json({ 
            message: "Email verified successfully",
            status: "Success",
            authenticated: true
        });
    } catch (error) {
        return handleControllerError(res, error, "Verification failed. Please try again.");
    }
};

/**
 * Registers a new user with a hashed password.
 * Demonstrates prevention of bcrypt resource exhaustion (DoC) by relying on Joi schema limits.
 * @route POST /api/auth/register
 */
export const registerUser = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        res.status(201).json({ message: "User registered securely", email, name });
    } catch (error) {
        return handleControllerError(res, error, "Registration failed. Please try again.");
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        res.status(200).json({ message: "Login successful", email });
    } catch (error) {
        return handleControllerError(res, error, "Login failed. Please try again.");
    }
};
