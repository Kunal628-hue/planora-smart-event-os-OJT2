import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error("❌ Error: MONGODB_URI is not defined in .env file.");
            return;
        }
        const conn = await mongoose.connect(uri);
        console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        // Removed process.exit(1) to allow server to start partially
    }
};

export default connectDB;
