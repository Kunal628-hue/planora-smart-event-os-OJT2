import express from "express";
import { sendOTP, verifyOTP, registerUser, loginUser } from "../controllers/authController.js";
import { validate as originalValidate, schemas } from "../middleware/validateInput.js";
import { validate } from "../middleware/validate.js";
import { loginSchema } from "../validation/schemas.js";


const router = express.Router();

router.post("/send-otp", originalValidate(schemas.auth.sendOtp), sendOTP);
router.post("/verify-otp", originalValidate(schemas.auth.verifyOtp), verifyOTP);
router.post("/register", originalValidate(schemas.user.register), registerUser);
router.post("/login", validate(loginSchema), loginUser);


export default router;
