import Task from "../models/Task.js";
import Event from "../models/Event.js";
import { getAllowedEventIds } from "../utils/authHelper.js";
import { handleControllerError } from "../utils/errorHandler.js";

export const createTask = async (req, res) => {
    try {
        const { event: eventId } = req.body;
        const event = await Event.findById(eventId);
        
        const taskData = { ...req.body };
        if (event) {
            taskData.user = event.user;
        }

        const task = await Task.create(taskData);
        res.status(201).json(task);
    } catch (error) {
        return handleControllerError(res, error, "Failed to create task. Please try again.");
    }
};

export const getTasks = async (req, res) => {
    try {
        const eventId = req.query.eventId;
        const userId = req.query.user || req.headers["x-user-id"];
        const userEmail = req.query.email || req.headers["x-user-email"];
        const filter = {};
        if (eventId) {
            filter.event = eventId;
        } else if (userId) {
            const allowedIds = await getAllowedEventIds(userId, userEmail);
            filter.event = { $in: allowedIds };
        }

        const tasks = await Task.find(filter).sort({ dueDate: 1 });
        res.json(tasks);
    } catch (error) {
        return handleControllerError(res, error, "Failed to retrieve tasks. Please try again.");
    }
};

export const updateTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(task);
    } catch (error) {
        return handleControllerError(res, error, "Failed to update task. Please try again.");
    }
};

export const deleteTask = async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: "Task removed" });
    } catch (error) {
        return handleControllerError(res, error, "Failed to delete task. Please try again.");
    }
};
