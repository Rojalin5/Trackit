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
      required: [true, "Task title is required"],
      trim: true,
    },
    description: String,
    dueDate: {
      type: Date,
      validate:{
        validator: function(value) {
          return !value || value > new Date();
        },
        message:"Invalid due date.",
      },
    },
    taskStatus: {
      type: String,
      enum: {
        values: ["pending", "completed", "overdue"],
        message: "Invalid task status",
      },
      default: "pending",
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high"],
        message: "Priority must be either low, medium, or high",
      },
      default: "medium",
      index: true,
    },

    isDeleted:{
      type:Boolean,
      default:false,
      index:true,
    },
    tags:
      {
        type: [String],
        default: [],
        index: true,
      },
    attachment: [
      {
        fileName: String,
        file: String, //url
        public_Id: String,
      },
    ],
    reminder: Date,
  },
  { timestamps: true }
);
taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ taskTitle: "text", description: "text" });
export const Task = mongoose.model("Task", taskSchema);
