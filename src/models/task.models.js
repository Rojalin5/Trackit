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
    status: {
      type: String,
      enum: ["Todo", "In-Progress", "Done"],
      default: "Todo",
      index:true
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
      index: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index:true
    },
    tag: [
      {
        type: String,
      },
    ],
    attachment: {
      fileName: String,
      file: String, //url
    },
    remainder: Date,
  },
  { timestamps: true }
);
taskSchema.index({user:1,dueDate:1})
taskSchema.index({taskTitle:"text",description:"text"})
export const Task = mongoose.model("Task", taskSchema);
