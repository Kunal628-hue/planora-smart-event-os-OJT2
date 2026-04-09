import Collaborator from "../models/Collaborator.js";
import Event from "../models/Event.js";
import Profile from "../models/Profile.js";
import { sendCollaboratorInvite } from "../utils/emailService.js";

export const getCollaborators = async (req, res) => {
    try {
        const { user, eventId } = req.query;
        let query = {};
        
        if (eventId) {
            query.event = eventId;
        } else if (user) {
            query.user = user;
        } else {
            return res.status(400).json({ message: "Context required (UID or EventID)" });
        }

        const collaborators = await Collaborator.find(query);
        
        // If eventId is provided, we should also find and return the Owner of the event
        // as they are the "Original Team Leader"
        let ownerInfo = null;
        if (eventId) {
            const event = await Event.findById(eventId);
            if (event) {
                const ownerProfile = await Profile.findOne({ user: event.user });
                
                // --- Authentic Identity Capture ---
                // We attempt to find the human name of the owner from any invite they've sent
                // across the entire system, not just this event, to ensure we get a real name.
                const systemWideInvite = await Collaborator.findOne({ user: event.user, inviterName: { $exists: true, $ne: "Workspace Owner" } });
                const authenticName = systemWideInvite?.inviterName || ownerProfile?.organization || "Original Team Lead";

                ownerInfo = {
                    _id: 'owner',
                    name: authenticName,
                    email: "Administrative Lead",
                    whatsapp: ownerProfile?.whatsapp || "",
                    role: "Event Lead",
                    status: "Active",
                    permissions: "Full administrative control over workspace",
                    isOwner: true,
                    userId: event.user
                };
            }
        }

        res.json(eventId ? { collaborators, owner: ownerInfo } : collaborators);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createCollaborator = async (req, res) => {
    try {
        const { inviterName, ...collabData } = req.body;
        
        // --- Proactive Contact Capture ---
        // Fetch the Team Leader's WhatsApp from their profile to attach to the invitation metadata.
        if (collabData.user) {
            const leaderProfile = await Profile.findOne({ user: collabData.user });
            if (leaderProfile && leaderProfile.whatsapp) {
                collabData.inviterWhatsApp = leaderProfile.whatsapp;
            }
        }

        const collaborator = await Collaborator.create(collabData);
        
        // Find the event title for the invitation email
        let eventName = "Event Context";
        if (collaborator.event) {
            const event = await Event.findById(collaborator.event);
            if (event) eventName = event.title || event.name;
        }

        // Send notification email
        await sendCollaboratorInvite(collaborator, inviterName || "A Team Lead", eventName);
        
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
