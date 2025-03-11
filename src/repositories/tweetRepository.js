import Tweet from "../models/Tweet.js";

class TweetRepository {
  async createTweet(tweetData) {
    return await new Tweet(tweetData).save();
  }

  async getPaginatedTweets(page, limit) {
    try {
      const tweets = await Tweet.find()
        .populate("userId") // Fetch user info
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const totalTweets = await Tweet.countDocuments();
      return {
        tweets,
        hasMore: page * limit < totalTweets,
      };
    } catch (error) {
      console.error("❌ Error fetching tweets:", error);
      throw new Error("Database error: Failed to fetch tweets");
    }
  }

  async getTrendingHashtags(limit = 10) {
    return await Tweet.aggregate([
      { $unwind: "$hashtags" },
      { $group: { _id: "$hashtags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);
  }

  async searchByHashtag(hashtag) {
    return await Tweet.find({ hashtags: hashtag.toLowerCase() }).populate("userId");
  }

  async getFeed(userId) {
    return await Tweet.find({ userId }).sort({ createdAt: -1 }).populate("userId");
  }

  async likeTweet(tweetId, userId) {
    return await Tweet.findByIdAndUpdate(tweetId, { $addToSet: { likes: userId } }, { new: true });
  }

  async retweet(tweetId, userId) {
    const originalTweet = await Tweet.findById(tweetId);
    if (!originalTweet) throw new Error("Tweet not found");

    const retweet = new Tweet({
      text: originalTweet.text,
      userId,
      media: originalTweet.media,
      visibility: "public",
      hashtags: originalTweet.hashtags,
      mentions: originalTweet.mentions,
    });

    return await retweet.save();
  }

  async replyToTweet(tweetId, userId, text) {
    const reply = new Tweet({ text, userId, visibility: "public" });
    const savedReply = await reply.save();
    await Tweet.findByIdAndUpdate(tweetId, { $push: { replies: savedReply._id } });
    return savedReply;
  }

  async getTweetById(tweetId) {
    return await Tweet.findById(tweetId).populate("userId");
  }

  async deleteTweet(tweetId, userId) {
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) throw new Error("Tweet not found");

    if (tweet.userId.toString() !== userId) throw new Error("Unauthorized");

    return await Tweet.findByIdAndDelete(tweetId);
  }
}

export default new TweetRepository();
