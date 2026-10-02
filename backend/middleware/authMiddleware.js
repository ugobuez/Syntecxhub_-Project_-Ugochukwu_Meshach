/**
 * Authentication middleware.
 * Verifies the JWT from either the httpOnly cookie or an
 * `Authorization: Bearer <token>` header, then attaches the user document
 * (without the password hash) to `req.user` for downstream handlers.
 */
const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    // 1. Resolve the token: cookie first, header as fallback
    let token = req.cookies?.token;

    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authorized — authentication token missing" });
    }

    // 2. Verify signature and expiry
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // 3. Ensure the user still exists
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ message: "Not authorized — user no longer exists" });
    }

    req.user = user;
    return next();
  } catch (error) {
    const message =
      error.name === "TokenExpiredError"
        ? "Session expired — please log in again"
        : "Not authorized — invalid token";
    return res.status(401).json({ message });
  }
};

module.exports = { protect };
