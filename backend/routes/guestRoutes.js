import express from "express";
import multer from "multer";
import { createGuest, getGuests, updateGuest, deleteGuest, updateGuestStatusViaEmail, finalizeRSVP, bulkUploadGuests, getGuestPass } from "../controllers/guestController.js";
import { validate, schemas } from "../middleware/validateInput.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.route("/").post(validate(schemas.guest.create), createGuest).get(getGuests);
router.route("/bulk-upload").post(upload.single("file"), bulkUploadGuests);
router.route("/rsvp/:id/:status").get(updateGuestStatusViaEmail);
router.route("/rsvp/finalize/:id").post(validate(schemas.guest.rsvpFinalize), finalizeRSVP);
router.route("/pass/:id").get(getGuestPass); // Public guest pass page
router.route("/:id").patch(validate(schemas.guest.update), updateGuest).delete(deleteGuest);

export default router;
