import Transaction from "../model/Transaction.js";

// Create and return a new transaction record.
export const createTransaction = async ({
  amount,
  type,
  category,
  date,
  notes,
  createdBy,
}) => {
  const transaction = await Transaction.create({
    amount,
    type,
    category,
    date: date || Date.now(),
    notes,
    createdBy,
  });

  return transaction.toSafeObject();
};

// Fetch transactions using optional filters and pagination.
export const getAllTransactions = async ({
  type,
  category,
  startDate,
  endDate,
  page = 1,
  limit = 10,
}) => {
  // Build a MongoDB filter from optional query parameters.
  const filter = {};

  if (type) filter.type = type;
  if (category) filter.category = category;

  // Apply date range filtering when provided.
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  // Calculate offset based on current page and page size.
  const skip = (page - 1) * limit;

  // Execute data and count queries in parallel for performance.
  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .populate("createdBy", "name email role")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments(filter),
  ]);

  return {
    transactions: transactions.map((t) => t.toSafeObject()),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

// Retrieve a single transaction by id.
export const getTransactionById = async (id) => {
  const transaction = await Transaction.findById(id).populate(
    "createdBy",
    "name email role",
  );

  if (!transaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  return transaction.toSafeObject();
};

// Update a transaction with allowed fields and validate type/category mapping.
export const updateTransaction = async (id, updates) => {
  const transaction = await Transaction.findById(id);

  if (!transaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  // Apply only fields that are explicitly provided by the client.
  const allowedFields = ["amount", "type", "category", "date", "notes"];
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      transaction[field] = updates[field];
    }
  });

  // Ensure category is valid for the selected transaction type.
  const INCOME_CATEGORIES = [
    "salary",
    "freelance",
    "investment",
    "business",
    "gift",
    "other_income",
  ];
  const EXPENSE_CATEGORIES = [
    "rent",
    "food",
    "transport",
    "utilities",
    "healthcare",
    "education",
    "shopping",
    "entertainment",
    "travel",
    "other_expense",
  ];

  if (
    transaction.type === "income" &&
    !INCOME_CATEGORIES.includes(transaction.category)
  ) {
    const error = new Error(
      `Category '${transaction.category}' is not valid for income type`,
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    transaction.type === "expense" &&
    !EXPENSE_CATEGORIES.includes(transaction.category)
  ) {
    const error = new Error(
      `Category '${transaction.category}' is not valid for expense type`,
    );
    error.statusCode = 400;
    throw error;
  }

  await transaction.save();

  return transaction.toSafeObject();
};

// Soft-delete a transaction instead of permanently removing it.
export const deleteTransaction = async (id) => {
  const transaction = await Transaction.findById(id);

  if (!transaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  // Use model instance method to mark transaction as deleted.
  await transaction.softDelete();

  return true;
};

// Return the supported income and expense category lists.
export const getCategories = async () => {
  return Transaction.getCategories();
};
