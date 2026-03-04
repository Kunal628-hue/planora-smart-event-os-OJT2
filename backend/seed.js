import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "./models/Event.js";

dotenv.config();

const testConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("📡 Connected to MongoDB for seeding...");

        const testEvent = {
            title: "Test Planora Event",
            description: "This is a test event to verify MongoDB connection.",
            location: "Cloud City",
            date: new Date(),
            user: "test-user-123"
        };

        await Event.create(testEvent);
        console.log("✅ Test Event inserted successfully!");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding data:", error.message);
        process.exit(1);
    }
};

testConnection();
