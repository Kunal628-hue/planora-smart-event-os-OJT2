import Guest from "../models/Guest.js";
import Event from "../models/Event.js";
import { sendInvitation } from "../utils/emailService.js";
import { getAllowedEventIds } from "../utils/authHelper.js";

export const createGuest = async (req, res) => {
    try {
        const { event: eventId } = req.body;
        const event = await Event.findById(eventId);
        
        // Ensure the item is created under the event owner's namespace
        const guestData = { ...req.body };
        if (event) {
            guestData.user = event.user; 
        }

        const guest = await Guest.create(guestData);
        
        // If guest has an email, send the invitation
        if (guest.email && event) {
            await sendInvitation(guest, event.title);
        }

        res.status(201).json(guest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getGuests = async (req, res) => {
    try {
        const { eventId, user, email } = req.query;
        const filter = {};
        if (eventId) {
            filter.event = eventId;
        } else if (user) {
            const allowedIds = await getAllowedEventIds(user, email);
            filter.event = { $in: allowedIds };
        }

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

export const updateGuestStatusViaEmail = async (req, res) => {
    try {
        const { id, status } = req.params;
        
        if (!["Confirmed", "Declined"].includes(status)) {
            return res.status(400).send("Invalid status");
        }

        const guest = await Guest.findByIdAndUpdate(id, { status }, { new: true });
        
        if (!guest) {
            return res.status(404).send("Guest not found");
        }

        // Return a simple HTML confirmation page
        res.send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #2563eb;">RSVP Received!</h1>
                <p>Thank you, <strong>${guest.name}</strong>.</p>
                <p>Your status has been updated to: <span style="color: ${status === 'Confirmed' ? '#10b981' : '#ef4444'}; font-weight: bold;">${status}</span></p>
                <p>You can close this window now.</p>
                <a href="${process.env.APP_URL}" style="text-decoration: none; color: #2563eb; font-size: 0.9rem;">Return to Planora</a>
            </div>
        `);
    } catch (error) {
        res.status(500).send("Something went wrong. Please try again later.");
    }
};
