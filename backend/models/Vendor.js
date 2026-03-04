import mongoose from "mongoose";

const vendorSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        service: { type: String, required: true }, // Catering, Decor, Photography, etc.
        contact: { type: String },
        email: { type: String },
        cost: { type: Number, default: 0 },
        status: { type: String, default: "Inquiry" }, // Inquiry, Booked, Paid
        event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
        user: { type: String, required: true }, // Firebase UID
    },
    { timestamps: true }
);

const Vendor = mongoose.model("Vendor", vendorSchema);
export default Vendor;
