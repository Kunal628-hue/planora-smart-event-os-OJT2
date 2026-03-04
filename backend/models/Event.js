import mongoose from "mongoose";

const eventSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: false,
        },
        location: {
            type: String,
            required: true,
        },
        date: {
            type: String, // String to match frontend date-picker format easily
            required: true,
        },
        user: {
            type: String, // Firebase UID
            required: true,
        },
        budget: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            default: "Planned"
        }
    },
    {
        timestamps: true,
    }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
