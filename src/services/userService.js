import UserRepository from "../repositories/userRepository.js";

class UserService {
  async getAllUsers() {
    return await UserRepository.getAllUsers();
  }

  async getUserById(userId) {
    return await UserRepository.getUserById(userId);
  }

  async updateUser(userId, updateData) {
    return await UserRepository.updateUser(userId, updateData);
  }

  async deleteUser(userId) {
    return await UserRepository.deleteUser(userId);
  }

  async followUser(userId, targetUserId) {
    return await UserRepository.followUser(userId, targetUserId);
  }

  async unfollowUser(userId, targetUserId) {
    return await UserRepository.unfollowUser(userId, targetUserId);
  }

  async saveTweet(userId, tweetId) {
    return await UserRepository.saveTweet(userId, tweetId);
  }

  async unsaveTweet(userId, tweetId) {
    return await UserRepository.unsaveTweet(userId, tweetId);
  }

  async getSavedTweets(userId) {
    return await UserRepository.getSavedTweets(userId);
  }
}

export default new UserService();
