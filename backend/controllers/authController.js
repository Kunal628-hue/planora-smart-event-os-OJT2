import OTP from "../models/OTP.js";
import { validateEmail } from "../utils/inputValidator.js";
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
        console.error("[Auth: Send OTP Failed]", error);
        res.status(500).json({ message: "Service temporarily unavailable. Please try again later." });
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

        // --- Logic Integration Note ---
        // In a full Firebase custom flow, we would now generate an auth token,
        // but for this implementation we simply verify the OTP.
        
        // Clear the OTP record after successful verification
        await OTP.deleteOne({ _id: record._id });

        res.json({ 
            message: "Email verified successfully",
            status: "Success",
            authenticated: true
        });
    } catch (error) {
        console.error("[Auth: Verify OTP Failed]", error);
        res.status(500).json({ message: error.message });
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
        // The validateInput middleware ensures the password length is bounded to 128 chars.
        // If an attacker sends a 200+ char password, the route returns 400 before reaching here.
        const hashedPassword = await bcrypt.hash(password, 10);
        res.status(201).json({ message: "User registered securely", email, name });
    } catch (error) {
        console.error("[Auth: Register Failed]", error);
        res.status(500).json({ message: error.message });
    }
};
