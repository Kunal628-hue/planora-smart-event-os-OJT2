import mongoose from "mongoose";

const guestSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String },
        phone: { type: String },
        whatsapp: { type: String }, // WhatsApp contact number
        status: { type: String, default: "Pending" }, // Pending, Confirmed, Declined
        category: { type: String, default: "General" }, // Family, Friend, VIP, etc.
        event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
        user: { type: String, required: true }, // Firebase UID
    },
    { timestamps: true }
);

const Guest = mongoose.model("Guest", guestSchema);
export default Guest;
