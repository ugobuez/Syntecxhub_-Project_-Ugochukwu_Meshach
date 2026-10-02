const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getUser,
  logout,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { uploadProfileImage } = require("../middleware/uploadMiddleware");

/* Public routes ---------------------------------------------------------- */
router.post("/register", uploadProfileImage.single("image"), register);
router.post("/login", login);
router.post("/logout", logout);

/* Protected routes ------------------------------------------------------- */
router.get("/getUser", protect, getUser);

module.exports = router;
