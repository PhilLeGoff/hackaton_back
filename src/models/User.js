import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    bio: { type: String, maxlength: 160, default: "" },
    avatar: { type: String, default: "https://default-avatar.com/avatar.png" },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    savedTweets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tweet" }], // ✅ New field for saved tweets
    role: { type: String, enum: ["user", "admin"], default: "user" },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
