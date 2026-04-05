import express from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { loginLimiter, registerLimiter } from "../middleware/ratelimiter.js";
import {
  registerValidator,
  loginValidator,
  validateAuth,
} from "../validator/auth.validator.js";

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  "/register",
  registerLimiter,
  registerValidator,
  validateAuth,
  register,
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post("/login", loginLimiter, loginValidator, validateAuth, login);

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user profile
 * @access  Private
 */
router.get("/me", protect, getMe);

export default router;
