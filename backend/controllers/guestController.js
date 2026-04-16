import Guest from "../models/Guest.js";
import Event from "../models/Event.js";
import { sendInvitation, sendRejectionMail } from "../utils/emailService.js";
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
        const { id } = req.params;
        const { status } = req.body;

        const originalGuest = await Guest.findById(id);
        if (!originalGuest) return res.status(404).json({ message: "Guest not found" });

        // Handle Rejection Workflow
        if (status === "Rejected") {
            const event = await Event.findById(originalGuest.event);
            const eventName = event ? event.title || event.name : "Upcoming Event";
            
            // Send the polite rejection email
            await sendRejectionMail(originalGuest, eventName);
            
            // Purge the guest after rejection as requested
            await Guest.findByIdAndDelete(id);
            return res.json({ message: "Guest rejected and removed from registry", status: "Rejected" });
        }

        const guest = await Guest.findByIdAndUpdate(id, req.body, { new: true });
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

        const guest = await Guest.findById(id);
        if (!guest) {
            return res.status(404).send("Guest not found");
        }

        if (status === "Declined") {
            await Guest.findByIdAndUpdate(id, { status: "Declined" });
            return res.send(`
                <div style="font-family: 'Segoe UI', sans-serif; text-align: center; padding: 50px; background: #f8fafc; height: 100vh;">
                    <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); display: inline-block; max-width: 400px;">
                        <h1 style="color: #ef4444; margin-bottom: 10px;">Invitation Declined</h1>
                        <p style="color: #64748b;">We're sorry you can't make it, <strong>${guest.name}</strong>. Your response has been recorded.</p>
                        <a href="${process.env.APP_URL}" style="text-decoration: none; color: #2563eb; font-weight: 600;">Return to Planora</a>
                    </div>
                </div>
            `);
        }

        // If status is Confirmed, show a modern form to capture family size
        res.send(`
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f9ff; height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0;">
                <div style="background: white; padding: 40px; border-radius: 24px; box-shadow: 0 20px 50px rgba(37, 99, 235, 0.1); width: 100%; max-width: 450px; border: 1px solid #e0f2fe;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #0369a1; font-size: 28px; font-weight: 800; margin: 0;">Planora RSVP</h1>
                        <p style="color: #64748b; margin-top: 8px;">Yay! We're excited to have you, <strong>${guest.name}</strong>!</p>
                    </div>
                    
                    <form action="${process.env.BACKEND_URL}/api/guests/rsvp/finalize/${id}" method="POST">
                        <div style="margin-bottom: 25px;">
                            <label style="display: block; font-weight: 600; color: #1e293b; margin-bottom: 10px; font-size: 14px;">Total people attending from your party?</label>
                            <div style="position: relative;">
                                <input type="number" name="familySize" min="1" value="1" required style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 16px; transition: border-color 0.2s; box-sizing: border-box; outline: none;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'">
                                <p style="font-size: 12px; color: #94a3b8; margin-top: 8px;">Includes yourself and any family/friends.</p>
                            </div>
                        </div>
                        
                        <button type="submit" style="width: 100%; background: #2563eb; color: white; padding: 16px; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; transition: transform 0.2s, background 0.2s; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);" onmouseover="this.style.background='#1d4ed8'; this.style.transform='translateY(-1px)'" onmouseout="this.style.background='#2563eb'; this.style.transform='translateY(0)'">
                            Confirm My Attendance
                        </button>
                    </form>
                    
                    <p style="text-align: center; font-size: 12px; color: #cbd5e1; margin-top: 30px;">This response will be instantly updated in the event dashboard.</p>
                </div>
            </div>
        `);
    } catch (error) {
        res.status(500).send("Something went wrong. Please try again later.");
    }
};

export const finalizeRSVP = async (req, res) => {
    try {
        const { id } = req.params;
        let { familySize } = req.body;
        
        // Ensure familySize is a valid number and at least 1 (the guest themselves)
        familySize = parseInt(familySize) || 1;
        
        const guest = await Guest.findByIdAndUpdate(id, { 
            status: "Confirmed",
            familySize: familySize 
        }, { new: true });

        if (!guest) return res.status(404).send("Guest not found");

        res.send(`
            <div style="font-family: 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #ecfdf5; margin: 0;">
                <div style="background: white; padding: 50px; border-radius: 30px; box-shadow: 0 20px 40px rgba(16, 185, 129, 0.1); text-align: center; border: 1px solid #d1fae5;">
                    <div style="background: #10b981; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px;">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <h1 style="color: #064e3b; margin-bottom: 10px; font-size: 28px;">RSVP Confirmed!</h1>
                    <p style="color: #059669; font-size: 18px; margin-bottom: 30px;">Thank you, <strong>${guest.name}</strong>. We've registered <strong>${familySize}</strong> people for your party.</p>
                    <a href="${process.env.APP_URL}" style="background: #f0fdf4; color: #059669; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: 600; border: 1px solid #d1fae5;">Visit Planora</a>
                </div>
            </div>
        `);
    } catch (error) {
        res.status(500).send("Update failed. Please try again.");
    }
};

