import Vendor from "../models/Vendor.js";

export const createVendor = async (req, res) => {
    try {
        const vendor = await Vendor.create(req.body);
        res.status(201).json(vendor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getVendors = async (req, res) => {
    try {
        const { eventId, user } = req.query;
        const filter = {};
        if (eventId) filter.event = eventId;
        if (user) filter.user = user;

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
