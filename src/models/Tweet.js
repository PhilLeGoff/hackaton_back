import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // ✅ Generates a unique ID for each comment
  text: { type: String, required: true, maxlength: 280 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sentAt: { type: Date, default: Date.now },
});

const tweetSchema = new mongoose.Schema(
  {
    text: { type: String, maxlength: 280 }, // Optional for retweets
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    retweets: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // ✅ Stores who retweeted

    // Retweet tracking (if the tweet is a retweet)
    originalTweet: { type: mongoose.Schema.Types.ObjectId, ref: "Tweet", default: null },
    retweetedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    retweetedAt: { type: Date, default: null },

    media: { 
      url: { type: String },
      type: { type: String, enum: ["image", "video"] }
    },

    hashtags: [{ type: String, index: true }],
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    visibility: { type: String, enum: ["public", "private"], default: "public" },

    // ✅ Comments as Subdocuments (with `_id`)
    comments: [commentSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Tweet", tweetSchema);
