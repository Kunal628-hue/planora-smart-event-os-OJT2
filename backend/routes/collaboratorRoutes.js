import express from "express";
import { getCollaborators, createCollaborator, updateCollaborator, deleteCollaborator } from "../controllers/collaboratorController.js";

const router = express.Router();

router.get("/", getCollaborators);
router.post("/", createCollaborator);
router.patch("/:id", updateCollaborator);
router.delete("/:id", deleteCollaborator);

export default router;
