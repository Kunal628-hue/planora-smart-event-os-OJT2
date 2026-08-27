import * as xlsx from "xlsx";
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

export const bulkUploadCollaborators = async (req, res) => {
    try {
        const { eventId, user: userId, inviterName } = req.body;
        if (!req.file) return res.status(400).json({ message: "No Excel or CSV file provided." });
        if (!eventId) return res.status(400).json({ message: "Event ID context is required." });

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: "Event not found." });

        let rows = [];
        try {
            const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });
        } catch (readErr) {
            console.error("[Collaborators Bulk Upload] Read error:", readErr);
            return res.status(400).json({ message: "Failed to parse Excel/CSV spreadsheet." });
        }

        if (!Array.isArray(rows) || rows.length === 0) {
            return res.status(400).json({ message: "Spreadsheet contains no records." });
        }

        const validRoles = ["Event Lead", "Editor", "Viewer"];
        const collaboratorsToCreate = [];

        for (const row of rows) {
            const getVal = (possibleKeys) => {
                const foundKey = Object.keys(row).find(k => possibleKeys.some(p => k.toLowerCase().includes(p.toLowerCase())));
                return foundKey ? String(row[foundKey]).trim() : "";
            };

            const name = getVal(["name", "full name", "member", "collaborator"]);
            const email = getVal(["email", "mail", "e-mail"]);
            const whatsapp = getVal(["whatsapp", "phone", "mobile", "contact"]);
            let role = getVal(["role", "access", "permission"]);

            if (!name || !email) continue;

            const matchedRole = validRoles.find(r => r.toLowerCase() === role.toLowerCase());
            role = matchedRole || "Editor";

            const permissions = role === "Editor" 
                ? "Can modify core modules" 
                : role === "Event Lead" 
                    ? "Full administrative control" 
                    : "Read-only access";

            collaboratorsToCreate.push({
                name,
                email,
                whatsapp,
                role,
                status: "Active",
                permissions,
                event: eventId,
                user: userId || event.user,
                inviterName: inviterName || "Workspace Owner"
            });
        }

        if (collaboratorsToCreate.length === 0) {
            return res.status(400).json({ message: "No valid member records found in file. Ensure spreadsheet has 'Name' and 'Email' columns." });
        }

        const createdCollaborators = await Collaborator.insertMany(collaboratorsToCreate);

        const eventName = event.title || event.name || "Upcoming Event";
        const eventLocation = event.location || "";
        Promise.all(createdCollaborators.map(c => 
            sendCollaboratorInvite(c, inviterName || "Workspace Lead", eventName, eventLocation).catch(() => {})
        ));

        res.status(201).json({
            message: `Successfully onboarded ${createdCollaborators.length} team member(s) from Excel sheet.`,
            count: createdCollaborators.length,
            collaborators: createdCollaborators
        });
    } catch (error) {
        return handleControllerError(res, error, "Failed to process team member spreadsheet upload.");
    }
};
