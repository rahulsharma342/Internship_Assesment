import { body, param, query, validationResult } from "express-validator";

// Category sets used for strict type/category validation.
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

const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

// Return validation errors in a consistent API response format.
export const validateTransaction = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  return next();
};

// Validate transaction id route parameter.
export const validateMongoId = [
  param("id")
    .notEmpty()
    .withMessage("Transaction ID is required")
    .isMongoId()
    .withMessage("Invalid Transaction ID format"),
];

// Validate transaction creation payload.
export const createTransactionValidator = [
  body().custom((value) => {
    const allowedFields = ["amount", "type", "category", "date", "notes"];
    const receivedFields = Object.keys(value);
    const isValid = receivedFields.every((field) =>
      allowedFields.includes(field),
    );
    if (!isValid) throw new Error("Invalid fields provided");
    return true;
  }),

  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),

  body("type")
    .notEmpty()
    .withMessage("Type is required")
    .isIn(["income", "expense"])
    .withMessage("Type must be income or expense"),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn(ALL_CATEGORIES)
    .withMessage("Invalid category"),

  // Ensure selected category belongs to the selected transaction type.
  body("category").custom((category, { req }) => {
    const type = req.body.type;

    if (type === "income" && !INCOME_CATEGORIES.includes(category)) {
      throw new Error(
        `Category '${category}' is not valid for income type. Valid: ${INCOME_CATEGORIES.join(", ")}`,
      );
    }

    if (type === "expense" && !EXPENSE_CATEGORIES.includes(category)) {
      throw new Error(
        `Category '${category}' is not valid for expense type. Valid: ${EXPENSE_CATEGORIES.join(", ")}`,
      );
    }

    return true;
  }),

  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be a valid date (YYYY-MM-DD)"),

  body("notes")
    .optional()
    .isString()
    .withMessage("Notes must be a string")
    .isLength({ max: 500 })
    .withMessage("Notes cannot exceed 500 characters"),
];

// Validate transaction update payload.
export const updateTransactionValidator = [
  ...validateMongoId,

  body().custom((value) => {
    const allowedFields = ["amount", "type", "category", "date", "notes"];
    const receivedFields = Object.keys(value);

    if (receivedFields.length === 0) {
      throw new Error("At least one field is required to update");
    }

    const isValid = receivedFields.every((field) =>
      allowedFields.includes(field),
    );
    if (!isValid) throw new Error("Invalid fields provided");
    return true;
  }),

  body("amount")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),

  body("type")
    .optional()
    .isIn(["income", "expense"])
    .withMessage("Type must be income or expense"),

  body("category")
    .optional()
    .isIn(ALL_CATEGORIES)
    .withMessage("Invalid category"),

  // If type and category are both provided, they must be compatible.
  body("category")
    .optional()
    .custom((category, { req }) => {
      const type = req.body.type;

      if (!type) return true; // Skip compatibility check when type is not being updated.

      if (type === "income" && !INCOME_CATEGORIES.includes(category)) {
        throw new Error(`Category '${category}' is not valid for income type`);
      }

      if (type === "expense" && !EXPENSE_CATEGORIES.includes(category)) {
        throw new Error(`Category '${category}' is not valid for expense type`);
      }

      return true;
    }),

  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be a valid date (YYYY-MM-DD)"),

  body("notes")
    .optional()
    .isString()
    .withMessage("Notes must be a string")
    .isLength({ max: 500 })
    .withMessage("Notes cannot exceed 500 characters"),
];

// Validate query filters and pagination for transaction listing.
export const filterTransactionValidator = [
  query("type")
    .optional()
    .isIn(["income", "expense"])
    .withMessage("Type must be income or expense"),

  query("category")
    .optional()
    .isIn(ALL_CATEGORIES)
    .withMessage("Invalid category"),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("startDate must be a valid date (YYYY-MM-DD)"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("endDate must be a valid date (YYYY-MM-DD)"),

  // Ensure endDate is not earlier than startDate.
  query("endDate")
    .optional()
    .custom((endDate, { req }) => {
      const startDate = req.query.startDate;
      if (startDate && new Date(endDate) < new Date(startDate)) {
        throw new Error("endDate cannot be before startDate");
      }
      return true;
    }),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive number"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];
