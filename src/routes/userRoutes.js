import express from "express";
import UserController from "../controllers/userController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// 🔹 Get All Users (Admin Only)
router.get("/", verifyToken, UserController.getAllUsers);

// 🔹 Get User Profile
router.get("/:userId", verifyToken, UserController.getUserById);

// 🔹 Update User Profile
router.put("/:userId", verifyToken, UserController.updateUser);

// 🔹 Delete User (Admin Only)
router.delete("/:userId", verifyToken, UserController.deleteUser);

// 🔹 Follow a User
router.post("/:userId/follow", verifyToken, UserController.followUser);

// 🔹 Unfollow a User
router.post("/:userId/unfollow", verifyToken, UserController.unfollowUser);

// 🔹 Get Saved Tweets
router.get("/:userId/saved-tweets", verifyToken, UserController.getSavedTweets);

// 🔹 Save a Tweet
router.post("/:userId/save-tweet/:tweetId", verifyToken, UserController.saveTweet);

// 🔹 Unsave a Tweet
router.post("/:userId/unsave-tweet/:tweetId", verifyToken, UserController.unsaveTweet);

export default router;
