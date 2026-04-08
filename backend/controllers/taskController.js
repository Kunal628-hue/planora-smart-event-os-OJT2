import Task from "../models/Task.js";
import Event from "../models/Event.js";
import { getAllowedEventIds } from "../utils/authHelper.js";

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
        res.status(500).json({ message: error.message });
    }
};

export const getTasks = async (req, res) => {
    try {
        const { eventId, user, email } = req.query;
        const filter = {};
        if (eventId) {
            filter.event = eventId;
        } else if (user) {
            const allowedIds = await getAllowedEventIds(user, email);
            filter.event = { $in: allowedIds };
        }

        const tasks = await Task.find(filter).sort({ dueDate: 1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteTask = async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: "Task removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
