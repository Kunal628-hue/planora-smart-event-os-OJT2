import express from "express";
import {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
} from "../controllers/eventController.js";
import { validate, schemas } from "../middleware/validateInput.js";

const router = express.Router();

router.route("/").post(validate(schemas.event.create), createEvent).get(getEvents);
router.route("/:id").get(getEventById).patch(validate(schemas.event.update), updateEvent).delete(deleteEvent);

export default router;
