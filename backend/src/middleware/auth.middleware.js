import jwt from "jsonwebtoken";
import User from "../model/User.js";

// Authenticate requests using bearer token or signed cookie token.
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.token;

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : cookieToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account inactive or user not found",
      });
    }

    req.user = {
      id: user._id,
      role: user.role,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
};
