import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Admin from "../models/Admin.js";

export const protect = async (req, res, next) => {
  let token;

  try {
    // Read token from HttpOnly cookie named "token"
    token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request object, exclude sensitive fields
    req.user = await User.findById(decoded.id).select("-passwordHash -securityPin");

    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};


// Middleware to protect admin routes
export const protectAdmin = async (req, res, next) => {
  try {
    const adminToken = req.cookies.adminToken;

    if (!adminToken) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = admin; // attach admin data to request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
