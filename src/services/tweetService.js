import TweetRepository from "../repositories/tweetRepository.js";
import mongoose from "mongoose";

class TweetService {
  extractHashtags(text) {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.toLowerCase()) : [];
  }

  async createTweet({ text, userId, file, visibility }) {
    const hashtags = this.extractHashtags(text);
    let media = null;

    if (file) {
      media = {
        url: file.path, 
        type: file.mimetype.startsWith("video") ? "video" : "image",
      };
    }

    const objectIdUserId = new mongoose.Types.ObjectId(userId);

    return await TweetRepository.createTweet({
      text,
      userId: objectIdUserId,
      media,
      visibility,
      hashtags
    });
  }

  async getTweets(page, limit) {
    try {
      const data = await TweetRepository.getPaginatedTweets(page, limit);
      return {
        tweets: data.tweets,
        hasMore: data.hasMore
      };
    } catch (error) {
      console.error("❌ Error in TweetService:", error);
      throw new Error("Failed to fetch tweets");
    }
  }

  async getRetweetCount(tweetId) {
    const tweet = await TweetRepository.findTweetById(tweetId);
    if (!tweet) throw new Error("Tweet not found");

    // ✅ If it's a retweet, return the count from the original tweet
    if (tweet.originalTweet) {
      const originalTweet = await TweetRepository.findTweetById(tweet.originalTweet);
      return originalTweet ? originalTweet.retweets.length : 0;
    }

    return tweet.retweets.length;
  }

  async toggleLike(tweetId, userId) {
    return await TweetRepository.toggleLike(tweetId, userId);
  }

  async retweet(tweetId, userId, text) {
    const originalTweet = await TweetRepository.findTweetById(tweetId);
    if (!originalTweet) throw new Error("Tweet not found");

    // Prevent duplicate retweets
    const existingRetweet = await TweetRepository.findRetweet(tweetId, userId);
    if (existingRetweet) throw new Error("Tweet already retweeted");

    // Extract hashtags from the retweet text
    const hashtags = text ? this.extractHashtags(text) : [];

    // Create a new retweet
    const retweet = await TweetRepository.createTweet({
      text: text || "", // Retweet text (optional)
      originalTweet: tweetId,
      retweetedBy: userId,
      retweetedAt: new Date(),
      hashtags, // Store extracted hashtags
      visibility: "public",
      userId: userId
    });

    // Add user to the original tweet's retweets array
    await TweetRepository.addRetweetToOriginal(tweetId, userId);

    return retweet;
  }

  async unretweet(tweetId, userId) {
    try {
      // Find the retweet by `originalTweet` and `retweetedBy`
      const retweet = await TweetRepository.findRetweet(tweetId, userId);
      if (!retweet) throw new Error("Retweet not found");
  
      // Delete the retweet
      await TweetRepository.deleteTweet(retweet._id);
  
      // Remove user from the original tweet's `retweets` array
      await TweetRepository.removeRetweetFromOriginal(tweetId, userId);
  
      return { message: "Retweet removed successfully" };
    } catch (error) {
      console.error("❌ Error in unretweet:", error);
      throw new Error("Failed to undo retweet");
    }
  }
  

  async undoRetweet(tweetId, userId) {
    return await TweetRepository.undoRetweet(tweetId, userId);
  }
}

export default new TweetService();
