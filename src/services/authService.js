import AuthRepository from "../repositories/authRepository.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

class AuthService {
  async registerUser(username, email, password, bio = "", avatarFile) {
    try {
      const existingUser = await AuthRepository.findUserByEmail(email);
      if (existingUser) {
        throw new Error("User already exists");
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      let avatarUrl = "https://default-avatar.com/avatar.png";

      if (avatarFile) {
        avatarUrl = avatarFile.path;
      }

      const newUser = await AuthRepository.createUser({
        username,
        email,
        password: hashedPassword,
        bio,
        avatar: avatarUrl,
      });

      const token = this.generateToken(newUser._id);

      return { token, user: newUser };
    } catch (error) {
      console.error("❌ Error in registerUser:", error);
      throw new Error(error.message || "Registration failed");
    }
  }

  async loginUser(email, password) {
    console.log("email & password", email, password)
    try {
      const user = await AuthRepository.findUserByEmail(email);
      if (!user) {
        throw new Error("Invalid credentials");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("Invalid credentials");
      }

      const token = this.generateToken(user._id);
      return { token, user };
    } catch (error) {
      console.error("❌ Error in loginUser:", error);
      throw new Error(error.message || "Login failed");
    }
  }

  generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
  }
}

export default new AuthService();
