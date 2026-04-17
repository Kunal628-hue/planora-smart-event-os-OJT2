import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const testConnection = async () => {
    const uri = process.env.MONGODB_URI;
    console.log("--- MongoDB Atlas Diagnostic ---");
    console.log(`URI Found: ${uri ? "YES (Check for hidden spaces)" : "NO"}`);
    
    if (!uri) {
        console.error("❌ Error: MONGODB_URI is undefined.");
        process.exit(1);
    }

    try {
        console.log("📡 Attempting connection to Atlas...");
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log("✅ SUCCESS: Connected to MongoDB Atlas!");
        console.log(`Host: ${mongoose.connection.host}`);
        process.exit(0);
    } catch (err) {
        console.error("❌ CONNECTION FAILED!");
        console.error(`Message: ${err.message}`);
        
        if (err.message.includes("bad auth")) {
            console.log("\n💡 ANALYSIS: Your username or password in the URI is incorrect.");
            console.log("1. Go to Atlas -> Database Access.");
            console.log("2. Reset the password for 'imsinghi2016_db_user' to 'Singhi143'.");
        } else if (err.message.includes("ETIMEDOUT") || err.message.includes("serverSelectionTimeoutMS")) {
            console.log("\n💡 ANALYSIS: Connection timed out. This is usually an IP Whitelist issue.");
            console.log("1. Go to Atlas -> Network Access.");
            console.log("2. Ensure '0.0.0.0/0' is added.");
        }
        process.exit(1);
    }
};

testConnection();
