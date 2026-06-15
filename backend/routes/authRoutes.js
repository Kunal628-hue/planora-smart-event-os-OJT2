import express from "express";
import { sendOTP, verifyOTP, registerUser } from "../controllers/authController.js";
import { validate, schemas } from "../middleware/validateInput.js";

const router = express.Router();

router.post("/send-otp", validate(schemas.auth.sendOtp), sendOTP);
router.post("/verify-otp", validate(schemas.auth.verifyOtp), verifyOTP);
router.post("/register", validate(schemas.user.register), registerUser);

export default router;
