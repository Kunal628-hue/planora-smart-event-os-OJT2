import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        return;
    }
    if (process.env.NODE_ENV === 'test') {
        return;
    }

    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error("❌ CRITICAL: MONGODB_URI is not defined in environment variables.");
            return;
        }

        console.log("📡 Connecting to MongoDB...");
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000, // Fail fast if connection cannot be established
        });
        
        isConnected = !!conn.connections[0].readyState;
        console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        // In serverless, we might want to throw here to let Vercel handle the restart
        // However, for now, we'll let it log so the user can see it in Vercel logs.
        throw error;
    }
};

export default connectDB;

