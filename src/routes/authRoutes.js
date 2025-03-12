import express from "express";
import AuthController from "../controllers/authController.js";
import { uploadAvatar } from "../middleware/upload.js";

const router = express.Router();

// Debugging log before handling request
router.post("/register", uploadAvatar.single("avatar"), (req, res) => {
  console.log("🔥 Register Route Hit!");
  console.log("📂 Uploaded File:", req.file ? req.file.path : "No avatar uploaded"); // Debugging

  AuthController.register(req, res);
});

// Login Route
router.post("/login", (req, res) => {
  console.log("🔥 Login Route Hit!");
  AuthController.login(req, res);
});

export default router;
