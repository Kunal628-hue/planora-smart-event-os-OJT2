import express from "express";
import { createGuest, getGuests, updateGuest, deleteGuest, updateGuestStatusViaEmail } from "../controllers/guestController.js";

const router = express.Router();

router.route("/").post(createGuest).get(getGuests);
router.route("/rsvp/:id/:status").get(updateGuestStatusViaEmail);
router.route("/:id").patch(updateGuest).delete(deleteGuest);

export default router;
