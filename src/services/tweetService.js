import TweetRepository from "../repositories/tweetRepository.js";
import mongoose from "mongoose";

class TweetService {
  extractHashtags(text) {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.toLowerCase()) : [];
  }

  async createTweet({ text, userId, file, visibility }) {
    try {
      const hashtags = this.extractHashtags(text);
      let media = null;

      if (file) {
        media = {
          url: file.path, // Cloudinary returns the file URL
          type: file.mimetype.startsWith("video") ? "video" : "image",
        };
      }

      const objectIdUserId = new mongoose.Types.ObjectId(userId);

      return await TweetRepository.createTweet({ text, userId: objectIdUserId, media, visibility, hashtags });
    } catch (error) {
      console.error("❌ Error in TweetService:", error);
      throw new Error("Tweet creation failed");
    }
  }

  async getTweets(page, limit) {
    try {
      return await TweetRepository.getPaginatedTweets(page, limit);
    } catch (error) {
      console.error("❌ Error in TweetService:", error);
      throw new Error("Failed to fetch tweets");
    }
  }

  async getTrendingHashtags() {
    return await TweetRepository.getTrendingHashtags();
  }

  async searchByHashtag(hashtag) {
    return await TweetRepository.searchByHashtag(hashtag.toLowerCase());
  }

  async getFeed(userId) {
    return await TweetRepository.getFeed(userId);
  }

  async likeTweet(tweetId, userId) {
    return await TweetRepository.likeTweet(tweetId, userId);
  }

  async retweet(tweetId, userId) {
    return await TweetRepository.retweet(tweetId, userId);
  }

  async replyToTweet(tweetId, userId, text) {
    return await TweetRepository.replyToTweet(tweetId, userId, text);
  }

  async getTweetById(tweetId) {
    return await TweetRepository.getTweetById(tweetId);
  }

  async deleteTweet(tweetId, userId) {
    return await TweetRepository.deleteTweet(tweetId, userId);
  }
}

export default new TweetService();
