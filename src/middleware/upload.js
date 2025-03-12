import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (!file) {
      console.log("🚫 No avatar uploaded, using default.");
      return null; // Return null if no file is uploaded
    }

    return {
      folder: "twitter-clone/avatars",
      allowed_formats: ["jpg", "png", "jpeg", "gif"],
      transformation: [{ width: 300, height: 300, crop: "fill" }],
      public_id: `avatar-${Date.now()}`,
    };
  },
});

// Tweet Media Storage (Images & Videos)
const tweetMediaStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "twitter-clone/tweets",
      allowed_formats: ["jpg", "png", "jpeg", "gif", "mp4", "mov", "avi"],
      resource_type: file.mimetype.startsWith("video") ? "video" : "image",
      public_id: `tweet-${Date.now()}`,
    };
  },
});

// Multer Upload Middleware
export const uploadAvatar = multer({ storage: avatarStorage });
export const uploadTweetMedia = multer({ storage: tweetMediaStorage });
