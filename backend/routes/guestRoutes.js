import express from "express";
import multer from "multer";
import { createGuest, getGuests, updateGuest, deleteGuest, updateGuestStatusViaEmail, finalizeRSVP, bulkUploadGuests } from "../controllers/guestController.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.route("/").post(createGuest).get(getGuests);
router.route("/bulk-upload").post(upload.single("file"), bulkUploadGuests);
router.route("/rsvp/:id/:status").get(updateGuestStatusViaEmail);
router.route("/rsvp/finalize/:id").post(finalizeRSVP);
router.route("/:id").patch(updateGuest).delete(deleteGuest);

export default router;
