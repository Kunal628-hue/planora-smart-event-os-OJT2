import mongoose from "mongoose";
import Guest from "./models/Guest.js";
import Event from "./models/Event.js";
import dotenv from "dotenv";
dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const guests = await Guest.find({ email: "imkunal2024@gmail.com" });
    console.log("MATCHING GUESTS IN DB:");
    for (const g of guests) {
        console.log(`- ID: ${g._id.toString()}, Event ID: ${g.event}, Category: ${g.category}, Name: ${g.name}`);
    }
    
    process.exit(0);
}
run();



