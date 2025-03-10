const mongoose = require("mongoose");

const tweetSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, maxlength: 280 },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    retweets: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tweet" }],
    media: [{ type: String }],
    hashtags: [{ type: String }],
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tweet", tweetSchema);
