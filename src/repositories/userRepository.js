import User from "../models/User.js";

class UserRepository {
  async getAllUsers() {
    return await User.find().select("-password");
  }

  async getUserById(userId) {
    return await User.findById(userId).select("-password");
  }

  async updateUser(userId, updateData) {
    return await User.findByIdAndUpdate(userId, updateData, { new: true });
  }

  async deleteUser(userId) {
    return await User.findByIdAndDelete(userId);
  }

  async followUser(userId, targetUserId) {
    await User.findByIdAndUpdate(userId, { $addToSet: { following: targetUserId } });
    await User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: userId } });
  }

  async unfollowUser(userId, targetUserId) {
    await User.findByIdAndUpdate(userId, { $pull: { following: targetUserId } });
    await User.findByIdAndUpdate(targetUserId, { $pull: { followers: userId } });
  }

  async saveTweet(userId, tweetId) {
    return await User.findByIdAndUpdate(userId, { $addToSet: { savedTweets: tweetId } });
  }

  async unsaveTweet(userId, tweetId) {
    return await User.findByIdAndUpdate(userId, { $pull: { savedTweets: tweetId } });
  }

  async getSavedTweets(userId) {
    return await User.findById(userId).populate("savedTweets");
  }
}

export default new UserRepository();
