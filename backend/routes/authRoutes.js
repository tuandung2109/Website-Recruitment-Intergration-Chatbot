// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Public routes
router.post("/login", authController.login);

// Protected routes
router.get("/profile", verifyToken, authController.getProfile);
router.get("/me", verifyToken, authController.getCurrentUserId);

module.exports = router;
