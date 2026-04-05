import * as transactionService from "../services/transaction.service.js";

// Create a new transaction.
export const createTransaction = async (req, res, next) => {
  try {
    const { amount, type, category, date, notes } = req.body;

    const transaction = await transactionService.createTransaction({
      amount,
      type,
      category,
      date,
      notes,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// Return paginated transactions with optional filters.
export const getAllTransactions = async (req, res, next) => {
  try {
    const filters = {
      type: req.query.type,
      category: req.query.category,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    };

    const result = await transactionService.getAllTransactions(filters);

    return res.status(200).json({
      success: true,
      message: "Transactions fetched successfully",
      count: result.transactions.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      data: result.transactions,
    });
  } catch (error) {
    next(error);
  }
};

// Return a single transaction by id.
export const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await transactionService.getTransactionById(
      req.params.id,
    );

    return res.status(200).json({
      success: true,
      message: "Transaction fetched successfully",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// Update an existing transaction.
export const updateTransaction = async (req, res, next) => {
  try {
    const { amount, type, category, date, notes } = req.body;

    const transaction = await transactionService.updateTransaction(
      req.params.id,
      { amount, type, category, date, notes },
    );

    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// Soft-delete a transaction record.
export const deleteTransaction = async (req, res, next) => {
  try {
    await transactionService.deleteTransaction(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Return supported transaction categories.
export const getCategories = async (req, res, next) => {
  try {
    const categories = await transactionService.getCategories();

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};
