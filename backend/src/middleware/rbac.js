// Role constants used across authorization checks.

export const ROLES = {
  VIEWER: "viewer",
  ANALYST: "analyst",
  ADMIN: "admin",
};

// Role precedence map where higher values indicate greater privileges.
const ROLE_LEVELS = {
  viewer: 1,
  analyst: 2,
  admin: 3,
};

// Authorize access for specific roles, e.g. authorize("admin").

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // `protect` must run first because it populates `req.user`.
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in first",
      });
    }

    const userRole = req.user.role;

    // Deny access when the authenticated role is not permitted.
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: [${allowedRoles.join(" or ")}]. Your role: ${userRole}`,
      });
    }

    next();
  };
};

// Authorize access for a minimum role level (e.g. analyst and above).

export const hasMinimumRole = (minimumRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in first",
      });
    }

    const userLevel = ROLE_LEVELS[req.user.role];
    const minimumLevel = ROLE_LEVELS[minimumRole];

    if (userLevel === undefined || minimumLevel === undefined) {
      return res.status(500).json({
        success: false,
        message: "Invalid role configuration",
      });
    }

    if (userLevel < minimumLevel) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Minimum required role: ${minimumRole}. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};

// Allow access to own resource; admins are allowed to access any resource.

export const isSelf = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Please log in first",
    });
  }

  const isAdmin = req.user.role === ROLES.ADMIN;
  const isOwnResource = req.user.id === req.params.id;

  if (!isAdmin && !isOwnResource) {
    return res.status(403).json({
      success: false,
      message: "Access denied. You can only access your own resources",
    });
  }

  next();
};
