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
        city: {
            type: String,
            default: "Mumbai"
        },
        country: {
            type: String,
            default: "India"
        },
        date: {
            type: String, // String to match frontend date-picker format easily
            required: true,
        },
        startDate: {
            type: String,
            required: false,
        },
        endDate: {
            type: String,
            required: false,
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
        },
        type: {
            type: String,
            default: "Other"
        },
        registrationConfig: {
            type: Object,
            default: null
        }
    },
    {
        timestamps: true,
    }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
