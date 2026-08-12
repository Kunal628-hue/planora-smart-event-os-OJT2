import express from "express";
import {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
} from "../controllers/eventController.js";
import { validate, schemas } from "../middleware/validateInput.js";
import { cacheRoute, clearCachePattern } from "../middleware/cacheMiddleware.js";

const router = express.Router();

const invalidateEventCache = async (req, res, next) => {
    await clearCachePattern("events");
    next();
};

router.route("/")
    .post(validate(schemas.event.create), invalidateEventCache, createEvent)
    .get(cacheRoute(180, "events"), getEvents);

router.route("/:id")
    .get(cacheRoute(180, "events"), getEventById)
    .patch(validate(schemas.event.update), invalidateEventCache, updateEvent)
    .delete(invalidateEventCache, deleteEvent);

export default router;
