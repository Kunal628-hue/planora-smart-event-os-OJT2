import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "./models/Event.js";

dotenv.config();

const checkEvents = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const events = await Event.find({});
        console.log("=== Current Events in DB ===");
        events.forEach(e => {
            console.log(`- ID: ${e._id} | Title: "${e.title}" | Type: "${e.type}" | User: "${e.user}"`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkEvents();
