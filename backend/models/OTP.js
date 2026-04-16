import mongoose from "mongoose";

const otpSchema = mongoose.Schema(
    {
        email: { type: String, required: true },
        code: { type: String, required: true },
        expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL Index: Auto-delete after expiration
    },
    { timestamps: true }
);

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;
