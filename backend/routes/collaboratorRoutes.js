import express from "express";
import multer from "multer";
import { getCollaborators, createCollaborator, updateCollaborator, deleteCollaborator, bulkUploadCollaborators } from "../controllers/collaboratorController.js";
import { validate, schemas } from "../middleware/validateInput.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", getCollaborators);
router.post("/", validate(schemas.collaborator.create), createCollaborator);
router.post("/bulk-upload", upload.single("file"), bulkUploadCollaborators);
router.patch("/:id", validate(schemas.collaborator.update), updateCollaborator);
router.delete("/:id", deleteCollaborator);

export default router;
