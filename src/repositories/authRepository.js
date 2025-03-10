import { User } from "../models/User.js";
import { Types } from "mongoose";

class AuthRepository {
  async findUserByEmail(email) {
    try {
      return await User.findOne({ email });
    } catch (error) {
      console.error("❌ Error finding user by email:", error);
      throw new Error("Database error");
    }
  }

  async findUserById(userId) {
    try {
      return await User.findById(new Types.ObjectId(userId));
    } catch (error) {
      console.error("❌ Error finding user by ID:", error);
      throw new Error("Database error");
    }
  }

  async createUser(userData) {
    try {
      const newUser = new User(userData);
      return await newUser.save();
    } catch (error) {
      console.error("❌ Error creating user:", error);
      throw new Error("Database error");
    }
  }
}

export default new AuthRepository();
