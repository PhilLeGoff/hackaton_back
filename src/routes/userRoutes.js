import express from "express";
import UserController from "../controllers/userController.js";
import verifyToken from "../middleware/verifyToken.js";
import { uploadAvatar } from "../middleware/upload.js";

const router = express.Router();

// 🔹 Get All Users (Admin Only)
router.get("/", verifyToken, UserController.getAllUsers);

// 🔹 Get User Profile
router.get("/profile", verifyToken, UserController.getUserById);

router.get("/:userId", verifyToken, UserController.getProfileById);

// 🔹 Update User Profile
router.put("/:userId", verifyToken, uploadAvatar.single("avatar"), UserController.updateUser);

// 🔹 Delete User (Admin Only)
router.delete("/", verifyToken, UserController.deleteUser);

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

// ✅ Get users the logged-in user is following
router.get("/following/:userId", verifyToken, UserController.getFollowing);

// ✅ Get users who follow the logged-in user
router.get("/followers/:userId", verifyToken, UserController.getFollowers);

export default router;
