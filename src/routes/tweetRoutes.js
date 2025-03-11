import express from "express";
import TweetController from "../controllers/tweetController.js";
import { uploadTweetMedia } from "../middleware/upload.js";
import verifyToken from "../middleware/verifyToken.js";

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
router.post("/:tweetId/reply", verifyToken, (req, res) =>
  TweetController.replyToTweet(req, res)
);
router.get("/:tweetId", verifyToken, (req, res) =>
  TweetController.getTweetById(req, res)
);
router.delete("/:tweetId", verifyToken, (req, res) =>
  TweetController.deleteTweet(req, res)
);

export default router;
