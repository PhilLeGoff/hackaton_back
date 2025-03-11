import AuthService from "../services/authService.js";

class AuthController {
  async register(req, res) {
    try {
      console.log("🔥 Received Register Request:", req.body);
      console.log("📂 Uploaded File:", req.file); // Debugging file upload

      const { username, email, password, bio } = req.body;
      const avatar = req.file ? req.file.path : null; // Store uploaded avatar URL

      const { token, user } = await AuthService.registerUser(username, email, password, bio, avatar);
      return res.status(201).json({ token, user });
    } catch (error) {
      console.error("❌ Error in Register:", error);
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
