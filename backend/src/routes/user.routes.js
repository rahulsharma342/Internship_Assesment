import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/rbac.js";
import {
  updateRoleValidator,
  updateStatusValidator,
  validateUser,
} from "../validator/user.validator.js";

const router = express.Router();

// All routes are Admin only + must be logged in

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin)
 */
router.get("/", protect, authorize("admin"), getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get single user by ID
 * @access  Private (Admin)
 */
router.get("/:id", protect, authorize("admin"), getUserById);

/**
 * @route   PATCH /api/users/:id/role
 * @desc    Update user role
 * @access  Private (Admin)
 */
router.patch(
  "/:id/role",
  protect,
  authorize("admin"),
  updateRoleValidator,
  validateUser,
  updateUserRole,
);

/**
 * @route   PATCH /api/users/:id/status
 * @desc    Activate or deactivate user
 * @access  Private (Admin)
 */
router.patch(
  "/:id/status",
  protect,
  authorize("admin"),
  updateStatusValidator,
  validateUser,
  updateUserStatus,
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (Admin)
 */
router.delete("/:id", protect, authorize("admin"), deleteUser);

export default router;
