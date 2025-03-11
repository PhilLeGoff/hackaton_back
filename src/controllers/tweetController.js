import TweetService from "../services/tweetService.js";

class TweetController {
  async createTweet(req, res) {
    try {
      const { text, visibility } = req.body;
      const userId = req.user.id; // Get userId from token
      const file = req.file;

      console.log(req.file)

      const newTweet = await TweetService.createTweet({ text, userId, file, visibility });
      res.status(201).json(newTweet);
    } catch (error) {
      console.error("❌ Error creating tweet:", error);
      res.status(500).json({ message: error.message || "Server error" });
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
      const updatedTweet = await TweetService.likeTweet(tweetId, userId);
      res.json(updatedTweet);
    } catch (error) {
      console.error("❌ Error liking tweet:", error);
      res.status(500).json({ message: error.message || "Server error" });
    }
  }

  async retweet(req, res) {
    try {
      const { tweetId } = req.params;
      const userId = req.user.id;
      const retweetedTweet = await TweetService.retweet(tweetId, userId);
      res.json(retweetedTweet);
    } catch (error) {
      console.error("❌ Error retweeting:", error);
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
}

export default new TweetController();
