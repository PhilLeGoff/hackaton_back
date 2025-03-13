import TweetService from "../services/tweetService.js";

class TweetController {
  async createTweet(req, res) {
    try {
      const { text, visibility } = req.body;
      const userId = req.user.id; // Get userId from token
      const file = req.file;

      console.log(req.file);

      const newTweet = await TweetService.createTweet({
        text,
        userId,
        file,
        visibility,
      });
      res.status(201).json(newTweet);
    } catch (error) {
      console.error("❌ Error creating tweet:", error);
      res.status(500).json({ message: error.message || "Server error" });
    }
  }

  async getTweets(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const tweets = await TweetService.getTweets(
        parseInt(page),
        parseInt(limit)
      );
      res.json(tweets);
    } catch (error) {
      console.error("❌ Error fetching tweets:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  async getTrendingHashtags(req, res) {
    try {
      const trendingHashtags = await TweetService.getTrendingHashtags();
      res.json(trendingHashtags);
    } catch (error) {
      console.error("❌ Error fetching trending hashtags:", error);
      res.status(500).json({ message: error.message || "Server error" });
    }
  }

  async searchByHashtag(req, res) {
    try {
      const { hashtag } = req.params;
      const tweets = await TweetService.searchByHashtag(hashtag);
      res.json(tweets);
    } catch (error) {
      console.error("❌ Error searching tweets:", error);
      res.status(500).json({ message: error.message || "Server error" });
    }
  }

  async getFeed(req, res) {
    try {
      const userId = req.user.id;
      const feed = await TweetService.getFeed(userId);
      res.json(feed);
    } catch (error) {
      console.error("❌ Error fetching feed:", error);
      res.status(500).json({ message: error.message || "Server error" });
    }
  }

  async likeTweet(req, res) {
    try {
      const { tweetId } = req.params;
      const userId = req.user.id;
  
      const { updatedTweet, isLiked } = await TweetService.toggleLike(tweetId, userId);
  
      // ✅ Emit notification only when the tweet is liked
      if (isLiked && req.io) {
        req.io.emit("notification", { 
          userId: updatedTweet.userId.toString(), 
          type: "like", 
          tweetId 
        });
        console.log("🔔 Notification sent for like on tweet:", tweetId);
      } else {
        console.log("⚠️ Tweet unliked, no notification sent.");
      }
  
      res.json(updatedTweet);
    } catch (error) {
      console.error("❌ Error in likeTweet:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
  
  
  
  // Retweet a Tweet
  async retweet(req, res) {
    try {
      const { tweetId } = req.params;
      const { text } = req.body;
      const userId = req.user.id;
      console.log("userID", userId);
      const retweetedTweet = await TweetService.retweet(tweetId, userId, text);

      req.io.emit("notification", { 
        userId: retweetedTweet.userId, 
        type: "retweet", 
        tweetId 
      });

      res.json(retweetedTweet);
    } catch (error) {
      console.error("❌ Error in retweet:", error);
      res.status(500).json({ message: error.message || "Server error" });
    }
  }

  async unretweet(req, res) {
    try {
      const { tweetId } = req.params;
      const userId = req.user.id;
      console.log("in unretweet");
      const result = await TweetService.unretweet(tweetId, userId);
      res.json(result);
    } catch (error) {
      console.error("❌ Error in unretweet:", error);
      res.status(500).json({ message: error.message || "Server error" });
    }
  }

  async replyToTweet(req, res) {
    try {
      const { tweetId } = req.params;
      const { text } = req.body;
      const userId = req.user.id;
      const reply = await TweetService.replyToTweet(tweetId, userId, text);
      res.json(reply);
    } catch (error) {
      console.error("❌ Error replying to tweet:", error);
      res.status(500).json({ message: error.message || "Server error" });
    }
  }

  async getTweetById(req, res) {
    try {
      const { tweetId } = req.params;
      const tweet = await TweetService.getTweetById(tweetId);
      res.json(tweet);
    } catch (error) {
      console.error("❌ Error fetching tweet:", error);
      res.status(500).json({ message: error.message || "Server error" });
    }
  }

  async deleteTweet(req, res) {
    try {
      const { tweetId } = req.params;
      const userId = req.user.id;
      await TweetService.deleteTweet(tweetId, userId);
      res.json({ message: "Tweet deleted successfully" });
    } catch (error) {
      console.error("❌ Error deleting tweet:", error);
      res.status(500).json({ message: error.message || "Server error" });
    }
  }
  /**
   * Save a tweet
   */
  async saveTweet(req, res) {
    try {
      const { tweetId } = req.params;
      const userId = req.user.id;

      const response = await TweetService.saveTweet(userId, tweetId);

      req.io.emit("notification", { 
        userId: userId, 
        type: "save", 
        tweetId 
      });

      res.status(200).json(response);
    } catch (error) {
      console.error("❌ Error in TweetController.saveTweet:", error);
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Unsave a tweet
   */
  async unsaveTweet(req, res) {
    try {
      const { tweetId } = req.params;
      const userId = req.user.id;

      const response = await TweetService.unsaveTweet(userId, tweetId);
      res.status(200).json(response);
    } catch (error) {
      console.error("❌ Error in TweetController.unsaveTweet:", error);
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get saved tweets
   */
  async getSavedTweets(req, res) {
    try {
      const userId = req.user.id;
      const savedTweets = await TweetService.getSavedTweets(userId);
      res.status(200).json({ savedTweets });
    } catch (error) {
      console.error("❌ Error in TweetController.getSavedTweets:", error);
      res.status(500).json({ message: error.message });
    }
  }

  // ✅ Add Comment
  async addComment(req, res) {
    try {
      const { tweetId } = req.params;
      const { text } = req.body;
      const userId = req.user.id;

      const updatedTweet = await TweetService.addComment(tweetId, userId, text);
      req.io.emit("notification", { 
        userId: updatedTweet.userId.toString(), 
        type: "comment", 
        tweetId 
      });
      res.status(201).json(updatedTweet);
    } catch (error) {
      console.error("❌ Error adding comment:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // ✅ Edit Comment
  async editComment(req, res) {
    try {
      const { tweetId, commentId } = req.params;
      const { text } = req.body;
      const userId = req.user.id;

      const updatedTweet = await TweetService.editComment(
        tweetId,
        commentId,
        userId,
        text
      );
      res.status(200).json(updatedTweet);
    } catch (error) {
      console.error("❌ Error editing comment:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // ✅ Delete Comment
  async deleteComment(req, res) {
    try {
      const { tweetId, commentId } = req.params;
      const userId = req.user.id;

      const updatedTweet = await TweetService.deleteComment(
        tweetId,
        commentId,
        userId
      );
      res.status(200).json(updatedTweet);
    } catch (error) {
      console.error("❌ Error deleting comment:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // ✅ Get Comments
  async getComments(req, res) {
    try {
      const { tweetId } = req.params;
      const comments = await TweetService.getComments(tweetId);
      res.status(200).json(comments);
    } catch (error) {
      console.error("❌ Error fetching comments:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default new TweetController();
