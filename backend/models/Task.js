import mongoose from "mongoose";

const taskSchema = mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        dueDate: { type: String },
        priority: { type: String, default: "Medium" }, // Low, Medium, High
        status: { type: String, default: "To Do" }, // To Do, In Progress, Completed
        event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
        budget: { type: Number, default: 0 },
        user: { type: String, required: true }, // Firebase UID
    },
    { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;
