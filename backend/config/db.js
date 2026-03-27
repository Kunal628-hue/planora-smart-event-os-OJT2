import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        
        console.log("[DB Diagnostic] Checking MONGODB_URI...");
        if (!uri) {
            console.error("❌ CRITICAL: MONGODB_URI is UNDEFINED in process.env. Check Vercel Environment Variables.");
            return;
        } else {
            console.log(`📡 [DB Diagnostic] URI detected (Length: ${uri.length}). Host: ${uri.split('@')[1]?.split('/')[0] || "Unknown"}`);
        }
        
        console.log("📡 Attempting to connect to MongoDB...");
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
        });
        console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ [DB Diagnostic] MongoDB Connection FAILURE: ${error.message}`);
        if (error.message.includes("Authentication failed")) {
            console.error("👉 Solution: Your Password or Username in MONGODB_URI is incorrect.");
        } else if (error.message.includes("timed out")) {
            console.error("👉 Solution: MongoDB Atlas is likely blocking the connection. Check IP Access List (0.0.0.0/0).");
        }
    }
};

export default connectDB;
