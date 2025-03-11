import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, maxlength: 280 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    retweets: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tweet" }],
    media: { 
      url: { type: String },
      type: { type: String, enum: ["image", "video"] }
    },
    hashtags: [{ type: String, index: true }],
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    visibility: { type: String, enum: ["public", "private"], default: "public" },
  },
  { timestamps: true }
);

export default mongoose.model("Tweet", tweetSchema);
