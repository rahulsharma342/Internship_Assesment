import rateLimit from "express-rate-limit";

// Limit repeated login attempts to reduce brute-force risk.
export const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // max 5 requests per window
  message: {
    error: "Too many login attempts, try again after 1 minute",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limit account creation requests to prevent abuse.
export const registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: {
    error: "Too many accounts created, try later",
  },
});
