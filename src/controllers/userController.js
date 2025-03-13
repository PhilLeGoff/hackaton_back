import UserService from "../services/userService.js";

class UserController {
  async getAllUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error("❌ Error getting users:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async getUserById(req, res) {
    try {
      const userId = req.user.id; // Extract userId from token
      const user = await UserService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error("❌ Error getting user:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
  async getProfileById(req, res) {
    try {
      const userId = req.params.userId; // Extract userId from token
      const user = await UserService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error("❌ Error getting user:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async updateUser(req, res) {
    try {
      const userId = req.user.id; // Extract userId from token
  
      // Extract text fields from request body
      const { username, email, bio } = req.body;
  
      // ✅ Check if a file was uploaded
      const avatar = req.file ? req.file.path : null;
      console.log("avatar", avatar)
  
      // ✅ Create an object for update (Only include fields that are provided)
      const updateFields = { username, email, bio };
      if (avatar) {
        updateFields.avatar = avatar;
      }
  
      // ✅ Update user
      const updatedUser = await UserService.updateUser(userId, updateFields);
  
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("❌ Error updating user:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async deleteUser(req, res) {
    try {
      const userId = req.user.id; // Extract userId from token
      await UserService.deleteUser(userId);
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("❌ Error deleting user:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async followUser(req, res) {
    try {
      const userId = req.user.id; // Extract userId from token
      const targetUserId = req.params.userId;
      await UserService.followUser(userId, targetUserId);
      res.status(200).json({ message: "User followed successfully" });
    } catch (error) {
      console.error("❌ Error following user:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async unfollowUser(req, res) {
    try {
      const userId = req.user.id; // Extract userId from token
      const targetUserId = req.params.userId;
      await UserService.unfollowUser(userId, targetUserId);
      res.status(200).json({ message: "User unfollowed successfully" });
    } catch (error) {
      console.error("❌ Error unfollowing user:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async saveTweet(req, res) {
    try {
      const userId = req.user.id; // Extract userId from token
      const tweetId = req.params.tweetId;
      await UserService.saveTweet(userId, tweetId);
      res.status(200).json({ message: "Tweet saved successfully" });
    } catch (error) {
      console.error("❌ Error saving tweet:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async unsaveTweet(req, res) {
    try {
      const userId = req.user.id; // Extract userId from token
      const tweetId = req.params.tweetId;
      await UserService.unsaveTweet(userId, tweetId);
      res.status(200).json({ message: "Tweet unsaved successfully" });
    } catch (error) {
      console.error("❌ Error unsaving tweet:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async getSavedTweets(req, res) {
    try {
      const userId = req.user.id; // Extract userId from token
      const savedTweets = await UserService.getSavedTweets(userId);
      res.status(200).json(savedTweets);
    } catch (error) {
      console.error("❌ Error fetching saved tweets:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default new UserController();
