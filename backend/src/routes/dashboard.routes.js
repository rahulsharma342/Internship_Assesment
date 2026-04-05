import express from "express";
import {
  getSummary,
  getCategoryWise,
  getMonthlyTrends,
  getRecentActivity,
} from "../controllers/dashboard.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/rbac.js";

const router = express.Router();

/**
 * @route   GET /api/dashboard/summary
 * @desc    Total income, expense, balance
 * @access  Private (Viewer, Analyst, Admin)
 */
router.get(
  "/summary",
  protect,
  authorize("viewer", "analyst", "admin"),
  getSummary
);

/**
 * @route   GET /api/dashboard/category-wise
 * @desc    Category wise totals
 * @access  Private (Analyst, Admin)
 */
router.get(
  "/category-wise",
  protect,
  authorize("analyst", "admin"),
  getCategoryWise
);

/**
 * @route   GET /api/dashboard/monthly-trends
 * @desc    Month wise income and expense trends
 * @access  Private (Analyst, Admin)
 */
router.get(
  "/monthly-trends",
  protect,
  authorize("analyst", "admin"),
  getMonthlyTrends
);

/**
 * @route   GET /api/dashboard/recent-activity
 * @desc    Last 10 transactions
 * @access  Private (Viewer, Analyst, Admin)
 */
router.get(
  "/recent-activity",
  protect,
  authorize("viewer", "analyst", "admin"),
  getRecentActivity
);

export default router;