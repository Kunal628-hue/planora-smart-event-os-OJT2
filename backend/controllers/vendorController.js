import Vendor from "../models/Vendor.js";
import Event from "../models/Event.js";
import { getAllowedEventIds } from "../utils/authHelper.js";
import { handleControllerError } from "../utils/errorHandler.js";

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
        return handleControllerError(res, error, "Failed to create vendor. Please try again.");
    }
};

export const getVendors = async (req, res) => {
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

        const vendors = await Vendor.find(filter).sort({ name: 1 });
        res.json(vendors);
    } catch (error) {
        return handleControllerError(res, error, "Failed to retrieve vendors. Please try again.");
    }
};

export const updateVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(vendor);
    } catch (error) {
        return handleControllerError(res, error, "Failed to update vendor. Please try again.");
    }
};

export const deleteVendor = async (req, res) => {
    try {
        await Vendor.findByIdAndDelete(req.params.id);
        res.json({ message: "Vendor removed" });
    } catch (error) {
        return handleControllerError(res, error, "Failed to delete vendor. Please try again.");
    }
};
