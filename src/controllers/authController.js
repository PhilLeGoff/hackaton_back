import AuthService from "../services/authService.js";

class AuthController {
  async register(req, res) {
    try {
      console.log("🔥 Received Body:", req.body);
      console.log("🔥 Received File:", req.file);

      const { username, email, password, bio } = req.body;
      const avatarFile = req.file;

      if (!avatarFile) {
        return res.status(400).json({ message: "Avatar file is required!" });
      }

      const { token, user } = await AuthService.registerUser(username, email, password, bio, avatarFile);
      return res.status(201).json({ token, user });
    } catch (error) {
      console.error("❌ Error in register controller:", error);
      return res.status(400).json({ message: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      console.log(req.body)
      const { token, user } = await AuthService.loginUser(email, password);
      return res.status(200).json({ token, user });
    } catch (error) {
      console.error("❌ Error in login controller:", error);
      return res.status(400).json({ message: error.message });
    }
  }
}

export default new AuthController();
