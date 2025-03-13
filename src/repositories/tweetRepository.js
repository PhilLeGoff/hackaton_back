import Tweet from "../models/Tweet.js";
import User from "../models/User.js";

class TweetRepository {
  async createTweet(tweetData) {
    return (await new Tweet(tweetData).save()).populate("originalTweet");
  }

  async getPaginatedTweets(page, limit) {
    try {
      const tweets = await Tweet.find()
        .populate("userId", "username avatar")
        .populate("retweetedBy", "username avatar")
        .populate({
          path: "originalTweet",
          populate: { path: "userId", select: "username avatar" }, // Fetch original tweet details
        })
        .sort({
          updatedAt: -1, // ✅ Sort by the most recent update (works for both tweets & retweets)
        })
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

  async findRetweet(originalTweetId, userId) {
    return await Tweet.findOne({
      originalTweet: originalTweetId,
      retweetedBy: userId,
    });
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
      const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { $pull: { likes: userId } },
        { new: true }
      );
      return { updatedTweet, isLiked: false }; // ✅ Return `isLiked: false`
    } else {
      const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { $addToSet: { likes: userId } },
        { new: true }
      );
      return { updatedTweet, isLiked: true }; // ✅ Return `isLiked: true`
    }
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

  /**
   * Find tweet by ID
   */
  async findTweetById(tweetId) {
    try {
      return await Tweet.findById(tweetId);
    } catch (error) {
      console.error("❌ Error finding tweet:", error);
      throw new Error("Error finding tweet");
    }
  }

  /**
   * Save a tweet for a user
   */
  async saveTweetForUser(userId, tweetId) {
    try {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { savedTweets: tweetId },
      });
    } catch (error) {
      console.error("❌ Error saving tweet:", error);
      throw new Error("Error saving tweet");
    }
  }

  /**
   * Unsave a tweet for a user
   */
  async unsaveTweetForUser(userId, tweetId) {
    try {
      await User.findByIdAndUpdate(userId, { $pull: { savedTweets: tweetId } });
    } catch (error) {
      console.error("❌ Error unsaving tweet:", error);
      throw new Error("Error unsaving tweet");
    }
  }

  /**
   * Get all saved tweets for a user
   */
  async getSavedTweetsByUser(userId) {
    try {
      const user = await User.findById(userId).populate("savedTweets");
      return user ? user.savedTweets : [];
    } catch (error) {
      console.error("❌ Error fetching saved tweets:", error);
      throw new Error("Error fetching saved tweets");
    }
  }

  // ✅ Add Comment
  async addComment(tweetId, userId, text, mentionedUserIds) {
    return await Tweet.findByIdAndUpdate(
      tweetId,
      {
        $push: {
          comments: {
            userId,
            text,
            sentAt: new Date(),
            mentions: mentionedUserIds, // ✅ Store mentioned users
          },
        },
      },
      { new: true }
    ).populate("comments.userId", "username avatar");
  }

  // ✅ Edit Comment
  async editComment(tweetId, commentId, userId, text) {
    return await Tweet.findOneAndUpdate(
      { _id: tweetId, "comments._id": commentId, "comments.userId": userId },
      { $set: { "comments.$.text": text } },
      { new: true }
    );
  }

  // ✅ Delete Comment
  async deleteComment(tweetId, commentId, userId) {
    return await Tweet.findByIdAndUpdate(
      tweetId,
      { $pull: { comments: { _id: commentId, userId } } },
      { new: true }
    );
  }

  // ✅ Get Comments
  async getComments(tweetId) {
    const tweet = await Tweet.findById(tweetId).populate(
      "comments.userId",
      "username avatar"
    );
    return tweet ? tweet.comments : [];
  }

  async findTweetsByHashtag(hashtag) {
    try {
      console.log("🔍 Searching for hashtag:", hashtag);

      return await Tweet.find({
        hashtags: { $regex: hashtag, $options: "i" },
      }).populate("userId", "username avatar");
    } catch (error) {
      console.error("❌ Error in findTweetsByHashtag:", error);
      throw new Error("Database error while searching by hashtag");
    }
  }

  // ✅ Find tweets mentioning a user (Partial username search)
  async findTweetsByMention(username) {
    try {
      console.log("🔍 Searching for mentions of:", username);

      // Find users whose username **contains** the query
      const users = await User.find({
        username: { $regex: username, $options: "i" },
      }).select("_id");

      if (!users.length) return [];

      // Extract user IDs
      const userIds = users.map((user) => user._id);

      return await Tweet.find({ mentions: { $in: userIds } }).populate(
        "userId",
        "username avatar"
      );
    } catch (error) {
      console.error("❌ Error in findTweetsByMention:", error);
      throw new Error("Database error while searching by mention");
    }
  }

  // ✅ Find tweets containing a text query
  async findTweetsByText(query) {
    try {
      console.log("🔍 Searching tweets with query:", query);

      return await Tweet.find({ text: { $regex: new RegExp(query, "i") } })
        .populate("userId", "username avatar") // ✅ Populating user info
        .populate("originalTweet") // ✅ Populating original tweet if it's a retweet
        .populate("retweetedBy", "username avatar") // ✅ Populating retweeter info
        .populate("likes") // ✅ Populating likes (if needed)
        .populate("retweets"); // ✅ Populating retweets (if needed)
    } catch (error) {
      console.error("❌ Error in findTweetsByText:", error);
      throw new Error("Database error while searching by text");
    }
  }

  async findTweetsByUser(id) {
    try {
      console.log("🔍 Finding tweets for user:", id);

      return await Tweet.find({ userId: id })
        .populate("userId", "username avatar") // ✅ Populating user info
        .populate("originalTweet") // ✅ Populating original tweet if it's a retweet
        .populate("retweetedBy", "username avatar") // ✅ Populating retweeter info
        .populate("likes") // ✅ Populating likes (if needed)
        .populate("retweets"); // ✅ Populating retweets (if needed);
    } catch (error) {
      console.error("❌ Error in findTweetsByUser:", error);
      throw new Error("Database error while searching tweets by user");
    }
  }
}

export default new TweetRepository();
