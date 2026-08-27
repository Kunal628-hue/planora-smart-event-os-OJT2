import mongoose from "mongoose";

const guestSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String },
        phone: { type: String },
        whatsapp: { type: String }, // WhatsApp contact number
        status: { type: String, default: "Pending" }, // Pending, Confirmed, Declined, Rejected
        familySize: { type: Number, default: 0 }, // Number of extra family members
        category: { type: String, default: "General" }, // Family, Friend, VIP, Tech, College
        linkedIn: { type: String }, // For tech/college events
        portfolio: { type: String }, // For tech/college events
        rejectionReason: { type: String }, // For selection feedback
        dietary: { type: String, default: "None" }, // Vegan, Vegetarian, etc.
        notes: { type: String }, // General notes
        entryCode: { type: String, unique: true, sparse: true }, // Unique pass code for event entry
        checkedIn: { type: Boolean, default: false }, // Event gate check-in status
        checkedInAt: { type: Date }, // Timestamp when guest entered venue
        event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
        user: { type: String, required: true }, // Firebase UID
    },
    { timestamps: true }
);

const Guest = mongoose.model("Guest", guestSchema);
export default Guest;
