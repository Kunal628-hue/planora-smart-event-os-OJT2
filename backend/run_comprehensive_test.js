import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "./models/Event.js";
import Guest from "./models/Guest.js";
import { 
    sendInvitation, 
    sendCollaboratorInvite, 
    sendOneDayAlert, 
    sendGeneralReminder 
} from "./utils/emailService.js";

dotenv.config();

const runTest = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB!");

        // 1. Resolve Planora Smart Hackathon Event
        let event = await Event.findOne({ title: "Planora Smart Hackathon" });
        if (!event) {
            console.log("Creating test Hackathon event...");
            event = await Event.create({
                title: "Planora Smart Hackathon",
                description: "A premium 48-hour development contest. Build the future with AI and edge servers.",
                location: "Vibrant Tech Hub, Mumbai",
                city: "Mumbai",
                country: "India",
                date: "2026-06-15",
                user: "test-user-123",
                budget: 150000,
                status: "Planned",
                type: "Hackathon"
            });
        }
        console.log(`Event resolved: ${event.title} (ID: ${event._id})`);

        // 2. Resolve Test Guest
        let guest = await Guest.findOne({ email: "imkunal2024@gmail.com", event: event._id });
        if (guest) {
            console.log("Cleaning up old test guest...");
            await Guest.deleteOne({ _id: guest._id });
        }
        
        console.log("Creating active test guest...");
        guest = await Guest.create({
            name: "Kunal Singhi",
            email: "imkunal2024@gmail.com",
            category: "VIP",
            status: "Confirmed",
            event: event._id,
            user: "test-user-123",
            whatsapp: "+918143614287",
            familySize: 1,
            entryCode: "HACK99VIP",
            dietary: "None",
            notes: "VVIP Attendee"
        });
        console.log(`Guest resolved: ${guest.name} (ID: ${guest._id})`);

        // 3. Dispatch Premium Emails
        console.log("\n==============================================");
        console.log("DISPATCHING PREMIUM TEST EMAILS");
        console.log("==============================================");
        
        // A. Invitation email
        console.log("1. Sending Invitation & Digital Badge email...");
        await sendInvitation(guest, event);

        // B. One-Day Countdown Alert email
        console.log("2. Sending 24h Countdown Alert email...");
        await sendOneDayAlert(guest, event, "Prepare your environment. The Hackathon begins in 24 hours. Ensure your dynamic badge is ready at the verification desks.");

        // C. General Reminder email
        console.log("3. Sending Save-the-Date General Reminder email...");
        await sendGeneralReminder(guest, event);

        // D. Collaborator Invite email
        console.log("4. Sending Team Collaborator invite email...");
        const mockCollaborator = {
            name: "Kunal Singhi",
            email: "imkunal2024@gmail.com",
            role: "Co-Organizer",
            permissions: "Full Access: Control, Budget, Collaborators"
        };
        await sendCollaboratorInvite(mockCollaborator, "Planora System", event.title, event.location);

        console.log("\n==============================================");
        console.log("DISPATCH COMPLETE. ALL EMAILS SENT.");
        console.log("==============================================");

        // 4. Generate & Output Premium WhatsApp message payload
        const cleanPhone = guest.whatsapp.replace(/[^0-9]/g, "");
        const passUrl = `http://localhost:5002/api/guests/pass/${guest._id}`;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;
        
        let waMsg = `━━━━━━━━━━━━━━━━━━━━━\n`;
        waMsg += `✨ *OFFICIAL INVITATION* ✨\n`;
        waMsg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
        waMsg += `Dear *${guest.name}*,\n\n`;
        waMsg += `You have been registered for *${event.title}*!\n\n`;
        waMsg += `📅 *Date:* ${event.date}\n`;
        waMsg += `📍 *Venue:* ${event.location}\n`;
        waMsg += `🎫 *Access Pass:* ${guest.category} Pass\n`;
        waMsg += `🔑 *Entry Code:* ${guest.entryCode}\n\n`;
        waMsg += `━━━━━━━━━━━━━━━━━━━━━\n`;
        waMsg += `🗺️ *Directions:* ${mapsUrl}\n`;
        waMsg += `🎟️ *View Digital Pass:* ${passUrl}\n`;
        waMsg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
        waMsg += `We've sent more details to your email. We look forward to welcoming you!`;

        const waLink = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(waMsg)}`;

        console.log("\n==============================================");
        console.log("PREMIUM WHATSAPP INVITATION MESSAGE DETAILS");
        console.log("==============================================");
        console.log("Recipient Phone:", guest.whatsapp);
        console.log("\n--- Message Text (Unicode Format) ---\n");
        console.log(waMsg);
        console.log("\n--- Clickable Trigger Link to Dispatch ---\n");
        console.log(waLink);
        console.log("==============================================");

        // Wait to finish connection
        await new Promise(resolve => setTimeout(resolve, 2000));
        process.exit(0);
    } catch (error) {
        console.error("Comprehensive test script failed:", error);
        process.exit(1);
    }
};

runTest();
