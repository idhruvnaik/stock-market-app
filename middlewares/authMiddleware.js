const jwt = require("jsonwebtoken");
const tokens = require("../utils/tokenUtil");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }
    const decoded = await tokens.verifyAccessToken(token);
    if (decoded?.error) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res
      .status(error?.code || 500)
      .json({ message: error?.message || "Internal Server Error" });
  }
};

module.exports = authMiddleware;
