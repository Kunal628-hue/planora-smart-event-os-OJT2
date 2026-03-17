import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "./models/Event.js";
import Guest from "./models/Guest.js";

dotenv.config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const eventsCount = await Event.countDocuments({});
        const guestsCount = await Guest.countDocuments({});

        console.log(`Total Events: ${eventsCount}`);
        console.log(`Total Guests: ${guestsCount}`);

        const users = await Event.distinct("user");
        console.log(`Unique user UIDs in Events:`, users);

        const guestUsers = await Guest.distinct("user");
        console.log(`Unique user UIDs in Guests:`, guestUsers);

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkData();
