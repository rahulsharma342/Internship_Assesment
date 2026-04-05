import * as authService from "../services/auth.service.js";

// Store JWT in an HTTP-only cookie to reduce XSS token exposure.
const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// Register a new user account.
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const result = await authService.registerUser({
      name,
      email,
      password,
    });

    setAuthCookie(res, result.token);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Authenticate user credentials and issue access token.
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser({ email, password });

    setAuthCookie(res, result.token);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Return profile information for the authenticated user.
export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
