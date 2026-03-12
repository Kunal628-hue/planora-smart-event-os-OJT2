import express from "express";
import {
    getEventHealth,
    getRiskAssessment,
    getSmartTimeline,
    getBudgetOptimization,
    getVendorRecommendations,
    askAiAssistant
} from "../controllers/aiController.js";

const router = express.Router();

router.get("/health/:eventId", getEventHealth);
router.get("/risk/:eventId", getRiskAssessment);
router.get("/timeline", getSmartTimeline);
router.get("/budget-opt/:eventId", getBudgetOptimization);
router.get("/vendors", getVendorRecommendations);
router.post("/chat", askAiAssistant);

export default router;
