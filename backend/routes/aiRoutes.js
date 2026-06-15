import express from "express";
import {
    getEventHealth,
    getRiskAssessment,
    getSmartTimeline,
    getBudgetOptimization,
    getVendorRecommendations,
    askAiAssistant,
    generateStrategicPlan,
    applyStrategicPlan
} from "../controllers/aiController.js";
import { validate, schemas } from "../middleware/validateInput.js";

const router = express.Router();

router.get("/health/:eventId", getEventHealth);
router.get("/risk/:eventId", getRiskAssessment);
router.get("/timeline", getSmartTimeline);
router.get("/budget-opt/:eventId", getBudgetOptimization);
router.get("/vendors", getVendorRecommendations);
router.post("/chat", validate(schemas.ai.chat), askAiAssistant);
router.get("/strategic-plan/:eventId", generateStrategicPlan);
router.post("/apply-plan", validate(schemas.ai.applyPlan), applyStrategicPlan);

export default router;
