import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error("❌ CRITICAL: MONGODB_URI is not defined.");
            return;
        }
        
        console.log("📡 Connecting to MongoDB...");
        const conn = await mongoose.connect(uri);
        console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
    }
};

export default connectDB;
