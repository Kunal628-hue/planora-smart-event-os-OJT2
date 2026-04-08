import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
    {
        user: { type: String, required: true, unique: true }, // Firebase UID
        whatsapp: { type: String },
        organization: { type: String },
        preferences: {
            notifications: { type: Boolean, default: true }
        }
    },
    { timestamps: true }
);

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;
