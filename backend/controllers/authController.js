/**
 * Authentication controller — register, login and current-user lookup.
 * Issues a signed JWT delivered both as an httpOnly cookie (for the browser)
 * and in the JSON body (for API clients that prefer headers).
 */
// bcryptjs is a drop-in, dependency-free implementation of bcrypt
// (avoids native build issues across platforms)
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const config = require("../config");
const User = require("../models/User");

/** Signs a JWT for the given user id. */
const generateToken = (userId) =>
  jwt.sign({ id: userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });

/** Sets the auth cookie with hardened options. */
const sendAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true, // invisible to client-side JS (XSS hardening)
    secure: config.IS_PROD, // HTTPS only in production
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/** Strips sensitive fields before responding. */
const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  profileImageUrl: user.profileImageUrl,
  createdAt: user.createdAt,
});

/**
 * POST /api/v1/auth/register
 * Accepts multipart/form-data: name, email, password and an optional image file.
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      profileImageUrl: req.file ? `/uploads/${req.file.filename}` : null,
    });

    const token = generateToken(user._id);
    sendAuthCookie(res, token);

    return res.status(201).json({
      message: "Account created successfully",
      user: sanitizeUser(user),
      token,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/v1/auth/login
 * Body: { email, password }
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Password uses `select: false`, so request it explicitly for the check
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
      // Deliberately generic — avoids leaking which emails exist
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);
    sendAuthCookie(res, token);

    return res.status(200).json({
      message: "Logged in successfully",
      user: sanitizeUser(user),
      token,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/auth/getUser
 * Protected — returns the authenticated user's profile.
 */
exports.getUser = async (req, res, next) => {
  try {
    // req.user is attached by the auth middleware (already password-less)
    return res.status(200).json({ user: sanitizeUser(req.user) });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/v1/auth/logout
 * Clears the auth cookie. Stateless JWTs cannot be revoked server-side,
 * so removing the cookie is the practical logout mechanism.
 */
exports.logout = async (_req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: config.IS_PROD,
    sameSite: "strict",
  });
  return res.status(200).json({ message: "Logged out successfully" });
};
