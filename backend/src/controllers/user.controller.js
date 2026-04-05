import * as userService from "../services/user.service.js";

// Return the complete user list.
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// Return a single user by id.
export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Update role for the targeted user.
export const updateUserRole = async (req, res, next) => {
  try {
    // Prevent administrators from changing their own role.
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    const user = await userService.updateUserRole(req.params.id, req.body.role);

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Activate or deactivate a user account.
export const updateUserStatus = async (req, res, next) => {
  try {
    // Prevent administrators from changing their own account status.
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own status",
      });
    }

    const user = await userService.updateUserStatus(
      req.params.id,
      req.body.isActive,
    );

    return res.status(200).json({
      success: true,
      message: `User ${req.body.isActive ? "activated" : "deactivated"} successfully`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Delete the targeted user account.
export const deleteUser = async (req, res, next) => {
  try {
    // Prevent administrators from deleting their own account.
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    await userService.deleteUser(req.params.id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
