
import mongoose from "mongoose";
import Guest from "./models/Guest.js";
import dotenv from "dotenv";
dotenv.config();

async function test() {
    try {
        const id = "661e78453cc14b87ae9524fa"; // From screenshot
        const familySize = "2";
        const parsedSize = parseInt(familySize) || 1;
        console.log("Parsed family size:", parsedSize);
        
        // This won't work without a real DB connection, but we can check the logic
        console.log("Update object:", { 
            status: "Confirmed",
            familySize: parsedSize 
        });
    } catch (error) {
        console.error("Error:", error);
    }
}

test();
