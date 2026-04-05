import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },

    type: {
      type: String,
      required: [true, "Transaction type is required"],
      enum: {
        values: ["income", "expense"],
        message: "Type must be income or expense",
      },
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      enum: {
        values: [
          // Income categories
          "salary",
          "freelance",
          "investment",
          "business",
          "gift",
          "other_income",
          // Expense categories
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
        ],
        message: "Invalid category",
      },
    },

    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      default: "",
    },

    // Reference to the user who created this transaction
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator reference is required"],
      index: true, // faster queries when filtering by user
    },

    // Soft delete — record is never truly deleted from DB
    isDeleted: {
      type: Boolean,
      default: false,
      select: false, // hidden by default, just like password in User
    },

    deletedAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true, // createdAt and updatedAt
  },
);

// ─── Indexes for faster Dashboard & Filter queries ────────────────────────────

// Compound index — most dashboard queries filter by type + date together
transactionSchema.index({ type: 1, date: -1 });

// Category queries for category-wise breakdown
transactionSchema.index({ category: 1 });

// Date range queries for trends (monthly/weekly)
transactionSchema.index({ date: -1 });

// ─── Query Helper: Automatically exclude soft deleted records ─────────────────
// This runs before every find query so you never accidentally fetch deleted records

transactionSchema.pre(/^find/, function () {
  this.where({ isDeleted: false });
});

// ─── Instance Method: Soft Delete ─────────────────────────────────────────────

transactionSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  await this.save();
};

// ─── Instance Method: Safe object to return in responses ─────────────────────

transactionSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    amount: this.amount,
    type: this.type,
    category: this.category,
    date: this.date,
    notes: this.notes,
    createdBy: this.createdBy,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// ─── Static Method: Get category list (useful for frontend dropdowns) ─────────

transactionSchema.statics.getCategories = function () {
  return {
    income: [
      "salary",
      "freelance",
      "investment",
      "business",
      "gift",
      "other_income",
    ],
    expense: [
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
    ],
  };
};

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
