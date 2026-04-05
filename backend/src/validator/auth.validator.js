import { body, validationResult } from "express-validator";

// Return authentication validation errors in a predictable format.
export const validateAuth = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  return next();
};

// Reject payloads that include unsupported fields.
const allowedFields = (fields) => {
  return body().custom((value, { req }) => {
    const receivedFields = Object.keys(req.body);

    const isValid = receivedFields.every((field) => fields.includes(field));

    if (!isValid) {
      throw new Error("Invalid fields provided");
    }

    return true;
  });
};

// Validate registration payload.
export const registerValidator = [
  allowedFields(["name", "email", "password"]),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters")
    .isLength({ max: 50 })
    .withMessage("Name cannot exceed 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .normalizeEmail()
    .isEmail()
    .withMessage("Enter a valid email"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),
];

// Validate login payload.
export const loginValidator = [
  allowedFields(["email", "password"]),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .normalizeEmail()
    .isEmail()
    .withMessage("Enter a valid email"),

  body("password").notEmpty().withMessage("Password is required"),
];
