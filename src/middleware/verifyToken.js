import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from header
    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid token" });

      req.user = decoded; // Attach decoded user data to request
      next();
    });
  } catch (error) {
    console.error("❌ Token verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default verifyToken;
