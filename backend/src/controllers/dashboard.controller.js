import * as dashboardService from "../services/dashboard.service.js";

// Return high-level financial totals (income, expense, and net balance).
export const getSummary = async (req, res, next) => {
  try {
    const summary = await dashboardService.getSummary();

    return res.status(200).json({
      success: true,
      message: "Summary fetched successfully",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

// Return grouped totals by category split by transaction type.
export const getCategoryWise = async (req, res, next) => {
  try {
    const categories = await dashboardService.getCategoryWise();

    return res.status(200).json({
      success: true,
      message: "Category wise data fetched successfully",
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// Return month-wise trend data for income and expenses.
export const getMonthlyTrends = async (req, res, next) => {
  try {
    const trends = await dashboardService.getMonthlyTrends();

    return res.status(200).json({
      success: true,
      message: "Monthly trends fetched successfully",
      data: trends,
    });
  } catch (error) {
    next(error);
  }
};

// Return the most recent transactions, capped by the requested limit.
export const getRecentActivity = async (req, res, next) => {
  try {
    // Use a default limit when the client does not provide one.
    const limit = parseInt(req.query.limit) || 10;

    // Guard against excessively large payloads.
    if (limit > 50) {
      return res.status(400).json({
        success: false,
        message: "Limit cannot exceed 50",
      });
    }

    const activity = await dashboardService.getRecentActivity(limit);

    return res.status(200).json({
      success: true,
      message: "Recent activity fetched successfully",
      count: activity.length,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};
