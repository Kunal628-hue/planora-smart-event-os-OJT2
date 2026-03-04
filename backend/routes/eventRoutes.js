import express from "express";
import {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
} from "../controllers/eventController.js";

const router = express.Router();

router.route("/").post(createEvent).get(getEvents);
router.route("/:id").get(getEventById).patch(updateEvent).delete(deleteEvent);

export default router;
