import jwt from "jsonwebtoken";
import User from "../model/User.js";

// Generate a signed JWT containing the user id and role.

const generateToken = (userId, role) => {
  return jwt.sign(
    {
      id: userId,
      role: role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );
};

// Register a user after enforcing email uniqueness.

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    name,
    email,
    password,
    // Role is intentionally omitted so the model default is applied.
  });

  const token = generateToken(user._id, user.role);

  return {
    user: user.toSafeObject(),
    token,
  };
};

// Validate user credentials and return token + safe profile.

export const loginUser = async ({ email, password }) => {
  // Explicitly include password because it is excluded by default in the model.
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // Prevent deactivated users from signing in.
  if (!user.isActive) {
    const error = new Error(
      "Your account has been deactivated. Please contact admin",
    );
    error.statusCode = 403;
    throw error;
  }

  // Compare input password with stored hash.
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // Create a fresh access token after successful authentication.
  const token = generateToken(user._id, user.role);

  // Return sanitized user details and token.
  return {
    user: user.toSafeObject(),
    token,
  };
};

// Fetch profile details for the authenticated user.

export const getProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error(
      "Your account has been deactivated. Please contact admin",
    );
    error.statusCode = 403;
    throw error;
  }

  return user.toSafeObject();
};
