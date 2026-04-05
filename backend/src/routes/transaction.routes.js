import express from "express";
import {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getCategories,
} from "../controllers/transaction.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/rbac.js";
import {
  createTransactionValidator,
  updateTransactionValidator,
  filterTransactionValidator,
  validateMongoId,
  validateTransaction,
} from "../validator/transaction.validator.js";

const router = express.Router();

/**
 * @route   GET /api/transactions/categories
 * @desc    Get all available categories
 * @access  Private (Viewer, Analyst, Admin)
 */
router.get(
  "/categories",
  protect,
  authorize("viewer", "analyst", "admin"),
  getCategories
);

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions with filters and pagination
 * @access  Private (Analyst, Admin)
 */
router.get(
  "/",
  protect,
  authorize("analyst", "admin"),
  filterTransactionValidator,
  validateTransaction,
  getAllTransactions
);

/**
 * @route   GET /api/transactions/:id
 * @desc    Get single transaction by ID
 * @access  Private (Analyst, Admin)
 */
router.get(
  "/:id",
  protect,
  authorize("analyst", "admin"),
  validateMongoId,
  validateTransaction,
  getTransactionById
);

/**
 * @route   POST /api/transactions
 * @desc    Create new transaction
 * @access  Private (Admin only)
 */
router.post(
  "/",
  protect,
  authorize("admin"),
  createTransactionValidator,
  validateTransaction,
  createTransaction
);

/**
 * @route   PUT /api/transactions/:id
 * @desc    Update transaction
 * @access  Private (Admin only)
 */
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateTransactionValidator,
  validateTransaction,
  updateTransaction
);

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Soft delete transaction
 * @access  Private (Admin only)
 */
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  validateMongoId,
  validateTransaction,
  deleteTransaction
);

export default router;