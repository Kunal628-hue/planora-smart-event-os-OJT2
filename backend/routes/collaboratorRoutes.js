import express from "express";
import { getCollaborators, createCollaborator, updateCollaborator, deleteCollaborator } from "../controllers/collaboratorController.js";
import { validate, schemas } from "../middleware/validateInput.js";

const router = express.Router();

router.get("/", getCollaborators);
router.post("/", validate(schemas.collaborator.create), createCollaborator);
router.patch("/:id", validate(schemas.collaborator.update), updateCollaborator);
router.delete("/:id", deleteCollaborator);

export default router;
