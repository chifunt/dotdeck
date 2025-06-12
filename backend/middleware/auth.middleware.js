/**
 * @file JWT authentication middleware.
 */

import jwt from "jsonwebtoken";

const { ACCESS_TOKEN_SECRET } = process.env;

/**
 * Attaches `req.user` if JWT is valid, else 401.
 */
export function authRequired(req, res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;

  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    req.user = jwt.verify(token, ACCESS_TOKEN_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
