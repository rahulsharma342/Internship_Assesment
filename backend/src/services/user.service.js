import User from "../model/User.js";

// Return all users sorted by newest first.
export const getAllUsers = async () => {
  const users = await User.find().sort({ createdAt: -1 });

  return users.map((user) => user.toSafeObject());
};

// Fetch a user by id.
export const getUserById = async (id) => {
  const user = await User.findById(id);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user.toSafeObject();
};

// Update role for a specific user.
export const updateUserRole = async (id, role) => {
  const user = await User.findById(id);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // Avoid unnecessary writes when the role is unchanged.
  if (user.role === role) {
    const error = new Error(`User already has the role: ${role}`);
    error.statusCode = 400;
    throw error;
  }

  user.role = role;
  await user.save();

  return user.toSafeObject();
};

// Activate or deactivate a user account.
export const updateUserStatus = async (id, isActive) => {
  const user = await User.findById(id);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // Avoid unnecessary writes when status is unchanged.
  if (user.isActive === isActive) {
    const error = new Error(
      `User is already ${isActive ? "active" : "inactive"}`,
    );
    error.statusCode = 400;
    throw error;
  }

  user.isActive = isActive;
  await user.save();

  return user.toSafeObject();
};

// Permanently remove a user account.
export const deleteUser = async (id) => {
  const user = await User.findById(id);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  await user.deleteOne();

  return true;
};
