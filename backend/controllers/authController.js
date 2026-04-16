import OTP from "../models/OTP.js";
import { sendOTPMail } from "../utils/emailService.js";

/**
 * Generates and sends a 6-digit OTP for email verification.
 * @route POST /api/auth/send-otp
 */
export const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

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
