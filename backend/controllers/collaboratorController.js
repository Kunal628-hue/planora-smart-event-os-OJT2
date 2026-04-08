import Collaborator from "../models/Collaborator.js";
import Event from "../models/Event.js";
import { sendCollaboratorInvite } from "../utils/emailService.js";
import { sendWhatsAppMessage } from "../utils/whatsappService.js";

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
        const { inviterName, ...collabData } = req.body;
        const collaborator = await Collaborator.create(collabData);
        
        // Find the event title for the invitation email
        let eventName = "Event Context";
        if (collaborator.event) {
            const event = await Event.findById(collaborator.event);
            if (event) eventName = event.title || event.name;
        }

        // Send notification email
        await sendCollaboratorInvite(collaborator, inviterName || "A Team Lead", eventName);
        
        // Send WhatsApp notification
        if (collaborator.whatsapp) {
            const waMessage = `Hello ${collaborator.name}, ${inviterName || "A Team Lead"} has added you to the event "${eventName}" on Planora. Please check your email for the activation link.`;
            await sendWhatsAppMessage(collaborator.whatsapp, waMessage);
        }

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
