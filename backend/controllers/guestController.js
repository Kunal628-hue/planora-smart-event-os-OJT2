import Guest from "../models/Guest.js";

export const createGuest = async (req, res) => {
    try {
        const guest = await Guest.create(req.body);
        res.status(201).json(guest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getGuests = async (req, res) => {
    try {
        const { eventId, user } = req.query;
        const filter = {};
        if (eventId) filter.event = eventId;
        if (user) filter.user = user;

        const guests = await Guest.find(filter).sort({ name: 1 });
        res.json(guests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateGuest = async (req, res) => {
    try {
        const guest = await Guest.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(guest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteGuest = async (req, res) => {
    try {
        await Guest.findByIdAndDelete(req.params.id);
        res.json({ message: "Guest removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
