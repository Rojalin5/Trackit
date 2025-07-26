import mongoose from "mongoose";
import { generateUserName } from "../utils/generateUserName.js";
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique:true,
      index: true
    },
    username: {
      type: String,
      required: true,
      unique:true
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Admin", "User", "SuperAdmin"],
      default: "User",
      required: true,
    },

    profilePicture: {
      type: String,
      default:
        "https://res.cloudinary.com/dfndsnvda/image/upload/v1743002788/profile_default_eapyvf.jpg",
    },
    yourTask:[ {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    }],
    refreshToken: String,
  },
  { timestamps: true }
);
userSchema.index({fullName:"text",username:"text",email:"text"})

userSchema.pre("save",async function(next) {
    this.username = await generateUserName(this.name) 
    
})
export const User = mongoose.model("User", userSchema);
