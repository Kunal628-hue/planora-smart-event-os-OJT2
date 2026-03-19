import mongoose from "mongoose";

const collaboratorSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        role: { type: String, required: true }, // Event Lead, Editor, Viewer
        permissions: { type: String },
        user: { type: String, required: true }, // Firebase UID of owner
        status: { type: String, default: "Active" }
    },
    { timestamps: true }
);

const Collaborator = mongoose.model("Collaborator", collaboratorSchema);
export default Collaborator;
