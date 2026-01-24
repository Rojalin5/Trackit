import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    taskTitle: {
      type: String,
      required: true,
      index: true,
    },
    description: String,
    dueDate: {
      type: Date,
      required: false,
      index: true,
    },
    taskStatus: {
      type: String,
      enum: ["todo", "in-Progress", "done"],
      default: "Todo",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "Medium",
      index: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    attachment: [{
      fileName: String,
      file: String, //url
    }],
    reminder: Date,
  },
  { timestamps: true }
);
taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ taskTitle: "text", description: "text" });
export const Task = mongoose.model("Task", taskSchema);
