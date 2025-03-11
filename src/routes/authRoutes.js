import express from "express";
import AuthController from "../controllers/authController.js";
import { uploadAvatar } from "../middleware/upload.js";

const router = express.Router();

// Debugging log before handling request
router.post("/register", uploadAvatar.single("avatar"), (req, res) => {
  console.log("🔥 Register Route Hit!");
  console.log("📂 Uploaded File:", req.file); // Check if the file is received
  console.log("📩 Request Body:", req.body); // Check if form fields are received

  AuthController.register(req, res);
});

// Login Route
router.post("/login", (req, res) => {
  console.log("🔥 Login Route Hit!");
  AuthController.login(req, res);
});

export default router;
