import Tweet from "../models/Tweet.js";

class TweetRepository {
  async createTweet(tweetData) {
    return await new Tweet(tweetData).save();
  }

  async getPaginatedTweets(page, limit) {
    try {
      const tweets = await Tweet.find()
        .populate("userId", "username")
        .populate("retweetedBy", "username")
        .populate({
          path: "originalTweet",
          populate: { path: "userId", select: "username" } // Fetch original tweet details
        })
        .sort({ retweetedAt: -1, createdAt: -1 }) 
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

  async findTweetById(tweetId) {
    return await Tweet.findById(tweetId).populate("userId", "username");
  }

  async findRetweet(originalTweetId, userId) {
    return await Tweet.findOne({ originalTweet: originalTweetId, retweetedBy: userId });
  }

  async addRetweetToOriginal(tweetId, userId) {
    return await Tweet.findByIdAndUpdate(
      tweetId,
      { $addToSet: { retweets: userId } }, 
      { new: true }
    );
  }

  async removeRetweetFromOriginal(tweetId, userId) {
    return await Tweet.findByIdAndUpdate(
      tweetId,
      { $pull: { retweets: userId } }, 
      { new: true }
    );
  }

  async undoRetweet(tweetId, userId) {
    try {
      const retweet = await this.findRetweet(tweetId, userId);
      if (!retweet) throw new Error("Retweet not found");

      // Delete the retweet
      await this.deleteTweet(retweet._id);

      // Remove user from the original tweet's retweets array
      await this.removeRetweetFromOriginal(tweetId, userId);

      return { message: "Retweet removed successfully" };
    } catch (error) {
      console.error("❌ Error in undoRetweet:", error);
      throw new Error("Failed to undo retweet");
    }
  }

  async deleteTweet(tweetId) {
    return await Tweet.findByIdAndDelete(tweetId);
  }

  async toggleLike(tweetId, userId) {
    const tweet = await this.findTweetById(tweetId);
    if (!tweet) throw new Error("Tweet not found");

    const hasLiked = tweet.likes.includes(userId);
    if (hasLiked) {
      return await Tweet.findByIdAndUpdate(
        tweetId,
        { $pull: { likes: userId } }, 
        { new: true }
      );
    } else {
      return await Tweet.findByIdAndUpdate(
        tweetId,
        { $addToSet: { likes: userId } }, 
        { new: true }
      );
    }
  }

  async findRetweet(originalTweetId, userId) {
    return await Tweet.findOne({ originalTweet: originalTweetId, retweetedBy: userId });
  }

  async deleteTweet(tweetId) {
    return await Tweet.findByIdAndDelete(tweetId);
  }

  async removeRetweetFromOriginal(tweetId, userId) {
    return await Tweet.findByIdAndUpdate(
      tweetId,
      { $pull: { retweets: userId } }, // Remove the user from retweets array
      { new: true }
    );
  }
}

export default new TweetRepository();
