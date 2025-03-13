import User from "../models/User.js";
import TweetRepository from "../repositories/tweetRepository.js";
import mongoose from "mongoose";

class TweetService {
  extractHashtags(text) {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map((tag) => tag.toLowerCase()) : [];
  }

  extractMentions(text) {
    const mentionRegex = /@(\w+)/g;
    const matches = text.match(mentionRegex);
    return matches ? matches.map((mention) => mention.substring(1)) : [];
  }

  async createTweet({ text, userId, file, visibility }) {
    const hashtags = this.extractHashtags(text);
    const mentionedUsernames = this.extractMentions(text);
    let media = null;

    if (file) {
      media = {
        url: file.path,
        type: file.mimetype.startsWith("video") ? "video" : "image",
      };
    }

    const objectIdUserId = new mongoose.Types.ObjectId(userId);

    const mentionedUsers = await User.find({
      username: { $in: mentionedUsernames },
    }).select("_id");
    const mentionedUserIds = mentionedUsers.map((user) => user._id);

    return await TweetRepository.createTweet({
      text,
      userId: objectIdUserId,
      media,
      visibility,
      hashtags,
      mentions: mentionedUserIds,
    });
  }

  async getTweets(page, limit) {
    try {
      const data = await TweetRepository.getPaginatedTweets(page, limit);
      return {
        tweets: data.tweets,
        hasMore: data.hasMore,
      };
    } catch (error) {
      console.error("❌ Error in TweetService:", error);
      throw new Error("Failed to fetch tweets");
    }
  }

  async deleteTweet(id) {
    try {
      await TweetRepository.deleteTweet(id);
      return 
    } catch (error) {
      console.error("❌ Error in TweetService:", error);
      throw new Error("Failed to fetch tweets");
    }
  }

  async getTweetById(tweetId) {
    try {
      return await TweetRepository.findTweetById(tweetId);
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
      const originalTweet = await TweetRepository.findTweetById(
        tweet.originalTweet
      );
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
      userId: userId,
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

  /**
   * Save a tweet
   */
  async saveTweet(userId, tweetId) {
    try {
      const tweet = await TweetRepository.findTweetById(tweetId);
      if (!tweet) {
        throw new Error("Tweet not found");
      }

      await TweetRepository.saveTweetForUser(userId, tweetId);
      return { message: "Tweet saved successfully" };
    } catch (error) {
      console.error("❌ Error in TweetService.saveTweet:", error);
      throw new Error(error.message || "Error saving tweet");
    }
  }

  /**
   * Unsave a tweet
   */
  async unsaveTweet(userId, tweetId) {
    try {
      await TweetRepository.unsaveTweetForUser(userId, tweetId);
      return { message: "Tweet unsaved successfully" };
    } catch (error) {
      console.error("❌ Error in TweetService.unsaveTweet:", error);
      throw new Error(error.message || "Error unsaving tweet");
    }
  }

  /**
   * Get saved tweets for a user
   */
  async getSavedTweets(userId) {
    try {
      return await TweetRepository.getSavedTweetsByUser(userId);
    } catch (error) {
      console.error("❌ Error in TweetService.getSavedTweets:", error);
      throw new Error(error.message || "Error fetching saved tweets");
    }
  }

  // ✅ Add Comment
  async addComment(tweetId, userId, text, io) {
    // ✅ Extract mentioned usernames from the comment
    const mentionedUsernames = this.extractMentions(text);

    // ✅ Fetch mentioned users from the database
    const mentionedUsers = await User.find({ username: { $in: mentionedUsernames } }).select("_id");
    const mentionedUserIds = mentionedUsers.map(user => user._id);

    // ✅ Store the comment in the database
    const updatedTweet = await TweetRepository.addComment(tweetId, userId, text, mentionedUserIds);

    const tweetOwnerId = updatedTweet.userId.toString();

    // ✅ Notify tweet owner (if they are not the commenter)
    if (tweetOwnerId !== userId) {
        const recipientSocketId = io.onlineUsers.get(tweetOwnerId);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("notification", {
                userId: tweetOwnerId,
                type: "comment",
                tweetId,
            });
            console.log(`🔔 Notification sent to ${tweetOwnerId} for comment on tweet: ${tweetId}`);
        }
    }

    // ✅ Notify mentioned users
    if (mentionedUserIds.length > 0 && io) {
        mentionedUserIds.forEach((mentionedUserId) => {
            const recipientSocketId = io.onlineUsers.get(mentionedUserId.toString());
            if (recipientSocketId) {
                io.to(recipientSocketId).emit("notification", {
                    userId: mentionedUserId.toString(),
                    type: "mentionComment",
                    tweetId,
                });
                console.log(`🔔 Notification sent to ${mentionedUserId} for mention in comment: ${tweetId}`);
            } else {
                console.log(`⚠️ Mentioned user ${mentionedUserId} is offline or not found in onlineUsers.`);
            }
        });
    }

    return updatedTweet;
}

  // ✅ Edit Comment
  async editComment(tweetId, commentId, userId, text) {
    return await TweetRepository.editComment(tweetId, commentId, userId, text);
  }

  // ✅ Delete Comment
  async deleteComment(tweetId, commentId, userId) {
    return await TweetRepository.deleteComment(tweetId, commentId, userId);
  }

  // ✅ Get Comments
  async getComments(tweetId) {
    return await TweetRepository.getComments(tweetId);
  }

  // ✅ Get tweets by hashtag
  async getTweetsByHashtag(hashtag) {
    try {
      return await TweetRepository.findTweetsByHashtag(hashtag);
    } catch (error) {
      console.error("❌ Error in getTweetsByHashtag:", error);
      throw new Error("Failed to search by hashtag");
    }
  }

  // ✅ Get tweets mentioning a specific username
  async getTweetsByMention(username) {
    try {
      return await TweetRepository.findTweetsByMention(username);
    } catch (error) {
      console.error("❌ Error in getTweetsByMention:", error);
      throw new Error("Failed to search by mention");
    }
  }

  // ✅ Get tweets by text search
  async getTweetsByText(query) {
    try {
      return await TweetRepository.findTweetsByText(query);
    } catch (error) {
      console.error("❌ Error in getTweetsByText:", error);
      throw new Error("Failed to search tweets by text");
    }
  }

  async findTweetsByUser(id) {
    try {
      return await TweetRepository.findTweetsByUser(id);
    } catch (error) {
      console.error("❌ Error in TweetService:", error);
      throw new Error("Error finding tweets by user");
    }
  }
}

export default new TweetService();
