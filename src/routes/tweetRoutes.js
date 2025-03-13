import express from "express";
import TweetController from "../controllers/tweetController.js";
import { uploadTweetMedia } from "../middleware/upload.js";
import verifyToken from "../middleware/verifyToken.js";
import Tweet from "../models/Tweet.js";
import tweetController from "../controllers/tweetController.js";

const router = express.Router();

// Protected Routes
router.post("/", verifyToken, uploadTweetMedia.single("media"), (req, res) =>
  TweetController.createTweet(req, res)
);
router.get("/", verifyToken, (req, res) => TweetController.getTweets(req, res));
router.get("/trending-hashtags", verifyToken, (req, res) =>
  TweetController.getTrendingHashtags(req, res)
);
router.get("/hashtag/:hashtag", verifyToken, (req, res) =>
  TweetController.searchByHashtag(req, res)
);
router.get("/feed", verifyToken, (req, res) =>
  TweetController.getFeed(req, res)
);
router.post("/:tweetId/like", verifyToken, (req, res) =>
  TweetController.likeTweet(req, res)
);
router.post("/:tweetId/retweet", verifyToken, (req, res) =>
  TweetController.retweet(req, res)
);
router.post("/:tweetId/undo-retweet", verifyToken, (req, res) =>
  tweetController.unretweet(req, res)
);
router.post("/:tweetId/reply", verifyToken, (req, res) =>
  TweetController.replyToTweet(req, res)
);
router.delete("/:tweetId", verifyToken, (req, res) =>
  TweetController.deleteTweet(req, res)
);
router.post("/:tweetId/save", verifyToken, (req, res) =>
  TweetController.saveTweet(req, res)
);
router.post("/:tweetId/unsave", verifyToken, (req, res) =>
  TweetController.unsaveTweet(req, res)
);
router.get("/saved", verifyToken, (req, res) =>
  TweetController.getSavedTweets(req, res)
);

// Comment Routes
router.post("/:tweetId/comment", verifyToken, (req, res) =>
  TweetController.addComment(req, res)
);
router.put("/:tweetId/comment/:commentId", verifyToken, (req, res) =>
  TweetController.editComment(req, res)
);
router.delete("/:tweetId/comment/:commentId", verifyToken, (req, res) =>
  TweetController.deleteComment(req, res)
);
router.get("/:tweetId/comments", verifyToken, (req, res) =>
  TweetController.getComments(req, res)
);


// ✅ Search Tweets by Hashtag
router.get("/hashtag/:hashtag", verifyToken, (req, res) => TweetController.searchByHashtag(req, res));

// ✅ Search Tweets by Mention (Username)
router.get("/mention/:username", verifyToken, (req, res) => TweetController.searchByMention(req, res));

// ✅ Search Tweets by Text Query
router.get("/search", verifyToken, (req, res) => TweetController.searchByText(req, res));

router.get("/:tweetId", verifyToken, (req, res) =>
  TweetController.getTweetById(req, res)
);

router.get("/search/user/", verifyToken, (req, res) =>
  TweetController.findTweetsByUser(req, res)
);

export default router;
