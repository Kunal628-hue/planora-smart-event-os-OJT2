import Collaborator from "../models/Collaborator.js";
import Event from "../models/Event.js";
import Profile from "../models/Profile.js";
import { sendCollaboratorInvite } from "../utils/emailService.js";
import { handleControllerError } from "../utils/errorHandler.js";

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
        
        let ownerInfo = null;
        if (eventId) {
            const event = await Event.findById(eventId);
            if (event) {
                const ownerProfile = await Profile.findOne({ user: event.user });
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
        return handleControllerError(res, error, "Failed to retrieve collaborators. Please try again.");
    }
};

export const createCollaborator = async (req, res) => {
    try {
        const { inviterName, ...collabData } = req.body;
        
        if (collabData.user) {
            const leaderProfile = await Profile.findOne({ user: collabData.user });
            if (leaderProfile && leaderProfile.whatsapp) {
                collabData.inviterWhatsApp = leaderProfile.whatsapp;
            }
        }

        const collaborator = await Collaborator.create(collabData);
        
        let eventName = "Event Context";
        let eventLocation = "";
        if (collaborator.event) {
            const event = await Event.findById(collaborator.event);
            if (event) {
                eventName = event.title || event.name;
                eventLocation = event.location;
            }
        }

        await sendCollaboratorInvite(collaborator, inviterName || "A Team Lead", eventName, eventLocation);
        
        res.status(201).json(collaborator);
    } catch (error) {
        return handleControllerError(res, error, "Failed to create collaborator. Please try again.");
    }
};

export const updateCollaborator = async (req, res) => {
    try {
        const collaborator = await Collaborator.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(collaborator);
    } catch (error) {
        return handleControllerError(res, error, "Failed to update collaborator. Please try again.");
    }
};

export const deleteCollaborator = async (req, res) => {
    try {
        await Collaborator.findByIdAndDelete(req.params.id);
        res.json({ message: "Collaborator removed" });
    } catch (error) {
        return handleControllerError(res, error, "Failed to delete collaborator. Please try again.");
    }
};
