import mongoose from "mongoose";

const collaboratorSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        role: { type: String, required: true }, // Event Lead, Editor, Viewer
        permissions: { type: String },
        whatsapp: { type: String }, // WhatsApp contact number
        user: { type: String, required: true }, // Firebase UID of owner
        inviterWhatsApp: { type: String }, // WhatsApp contact of the team leader
        event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" }, // Optional: link to a specific event
        status: { type: String, default: "Active" }
    },
    { timestamps: true }
);

const Collaborator = mongoose.model("Collaborator", collaboratorSchema);
export default Collaborator;
