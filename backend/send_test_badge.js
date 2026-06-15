import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "./models/Event.js";
import Guest from "./models/Guest.js";
import { sendInvitation } from "./utils/emailService.js";

dotenv.config();

const runTest = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB!");

        // 1. Create or Find test event
        let event = await Event.findOne({ title: "Planora Smart Hackathon" });
        if (!event) {
            console.log("Creating test Hackathon event...");
            event = await Event.create({
                title: "Planora Smart Hackathon",
                description: "A premium 48-hour development contest.",
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
        console.log(`Event: ${event.title} (Type: ${event.type})`);

        // 2. Create or Find test guest
        let guest = await Guest.findOne({ email: "imkunal2024@gmail.com", event: event._id });
        if (guest) {
            console.log("Found existing test guest. Deleting to send a fresh email...");
            await Guest.deleteOne({ _id: guest._id });
        }
        
        console.log("Creating test guest...");
        guest = await Guest.create({
            name: "Kunal Singhi",
            email: "imkunal2024@gmail.com",
            category: "Tech",
            status: "Confirmed",
            event: event._id,
            user: "test-user-123",
            whatsapp: "+918143614287",
            familySize: 1,
            entryCode: "HACK99",
            dietary: "None",
            notes: "Developer entry pass"
        });
        console.log(`Guest: ${guest.name} (${guest.email}), Entry Code: ${guest.entryCode}`);

        // 3. Send the invitation/badge preview email
        console.log("Sending invitation/badge email to imkunal2024@gmail.com...");
        await sendInvitation(guest, event);
        console.log("Email dispatch completed.");

        // Wait for connection to wrap up
        await new Promise(resolve => setTimeout(resolve, 3000));
        process.exit(0);
    } catch (error) {
        console.error("Test execution failed:", error);
        process.exit(1);
    }
};

runTest();
