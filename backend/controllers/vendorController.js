import Vendor from "../models/Vendor.js";
import Event from "../models/Event.js";
import { getAllowedEventIds } from "../utils/authHelper.js";

export const createVendor = async (req, res) => {
    try {
        const { event: eventId } = req.body;
        const event = await Event.findById(eventId);
        
        const vendorData = { ...req.body };
        if (event) {
            vendorData.user = event.user;
        }

        const vendor = await Vendor.create(vendorData);
        res.status(201).json(vendor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getVendors = async (req, res) => {
    try {
        const { eventId, user, email } = req.query;
        const filter = {};
        if (eventId) {
            filter.event = eventId;
        } else if (user) {
            const allowedIds = await getAllowedEventIds(user, email);
            filter.event = { $in: allowedIds };
        }

        const vendors = await Vendor.find(filter).sort({ name: 1 });
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(vendor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteVendor = async (req, res) => {
    try {
        await Vendor.findByIdAndDelete(req.params.id);
        res.json({ message: "Vendor removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
