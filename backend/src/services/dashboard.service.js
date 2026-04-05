import Transaction from "../model/Transaction.js";

// Build aggregate summary metrics for income, expense, and net balance.
export const getSummary = async () => {
  const result = await Transaction.aggregate([
    // Exclude soft-deleted records from analytics.
    { $match: { isDeleted: false } },

    // Group by transaction type and compute totals.
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  // Normalize aggregation output to API response format.
  const summary = {
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    incomeCount: 0,
    expenseCount: 0,
  };

  result.forEach((item) => {
    if (item._id === "income") {
      summary.totalIncome = item.total;
      summary.incomeCount = item.count;
    } else if (item._id === "expense") {
      summary.totalExpense = item.total;
      summary.expenseCount = item.count;
    }
  });

  summary.netBalance = summary.totalIncome - summary.totalExpense;

  return summary;
};

// Build category-wise totals, separated by transaction type.
export const getCategoryWise = async () => {
  const result = await Transaction.aggregate([
    // Exclude soft-deleted records from analytics.
    { $match: { isDeleted: false } },

    // Aggregate totals by category and type.
    {
      $group: {
        _id: {
          category: "$category",
          type: "$type",
        },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },

    // Sort categories by amount in descending order.
    { $sort: { total: -1 } },
  ]);

  // Split results into income and expense arrays.
  const income = [];
  const expense = [];

  result.forEach((item) => {
    const entry = {
      category: item._id.category,
      total: item.total,
      count: item.count,
    };

    if (item._id.type === "income") {
      income.push(entry);
    } else {
      expense.push(entry);
    }
  });

  return { income, expense };
};

// Build month-wise trends for income and expense.
export const getMonthlyTrends = async () => {
  const result = await Transaction.aggregate([
    // Exclude soft-deleted records from analytics.
    { $match: { isDeleted: false } },

    // Aggregate totals by year, month, and transaction type.
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },

    // Sort chronologically by year and month.
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ]);

  // Use short month labels for frontend-friendly output.
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Merge income and expense values for each month.
  const trendsMap = {};

  result.forEach((item) => {
    const key = `${item._id.year}-${item._id.month}`;

    if (!trendsMap[key]) {
      trendsMap[key] = {
        year: item._id.year,
        month: monthNames[item._id.month - 1],
        monthNumber: item._id.month,
        income: 0,
        expense: 0,
        netBalance: 0,
      };
    }

    if (item._id.type === "income") {
      trendsMap[key].income = item.total;
    } else {
      trendsMap[key].expense = item.total;
    }

    trendsMap[key].netBalance = trendsMap[key].income - trendsMap[key].expense;
  });

  return Object.values(trendsMap);
};

// Return the most recent transaction activity.
export const getRecentActivity = async (limit = 10) => {
  const transactions = await Transaction.find()
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 })
    .limit(limit);

  return transactions.map((t) => t.toSafeObject());
};
