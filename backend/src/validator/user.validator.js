import { body, param, validationResult } from "express-validator";

// Return user validation errors in a consistent response structure.
export const validateUser = (req, res, next) => {
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

// Reusable validator for MongoDB ObjectId route parameters.
export const validateMongoId = [
  param("id")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid User ID format"),
];

// Validate payload for role update endpoint.
export const updateRoleValidator = [
  ...validateMongoId,

  body().custom((value) => {
    const allowedFields = ["role"];
    const receivedFields = Object.keys(value);
    const isValid = receivedFields.every((field) =>
      allowedFields.includes(field),
    );
    if (!isValid) throw new Error("Only 'role' field is allowed");
    return true;
  }),

  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["viewer", "analyst", "admin"])
    .withMessage("Role must be viewer, analyst, or admin"),
];

// Validate payload for account status update endpoint.
export const updateStatusValidator = [
  ...validateMongoId,

  body().custom((value) => {
    const allowedFields = ["isActive"];
    const receivedFields = Object.keys(value);
    const isValid = receivedFields.every((field) =>
      allowedFields.includes(field),
    );
    if (!isValid) throw new Error("Only 'isActive' field is allowed");
    return true;
  }),

  body("isActive")
    .notEmpty()
    .withMessage("isActive is required")
    .isBoolean()
    .withMessage("isActive must be true or false"),
];
