import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

console.log("Testing connection...");
try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
    process.exit(0);
} catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
}
