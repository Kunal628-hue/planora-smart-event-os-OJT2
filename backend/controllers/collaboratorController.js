import Collaborator from "../models/Collaborator.js";

export const getCollaborators = async (req, res) => {
    try {
        const { user } = req.query;
        if (!user) return res.status(400).json({ message: "Owner UID required" });
        const collaborators = await Collaborator.find({ user });
        res.json(collaborators);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createCollaborator = async (req, res) => {
    try {
        const collaborator = await Collaborator.create(req.body);
        res.status(201).json(collaborator);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCollaborator = async (req, res) => {
    try {
        const collaborator = await Collaborator.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(collaborator);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteCollaborator = async (req, res) => {
    try {
        await Collaborator.findByIdAndDelete(req.params.id);
        res.json({ message: "Collaborator removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
