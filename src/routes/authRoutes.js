import express from "express";
import AuthController from "../controllers/authController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/register", upload.single("avatar"), (req, res) => AuthController.register(req, res));
router.post("/login", (req, res) => AuthController.login(req, res));

export default router;
