/**
 * @file JWT authentication middleware.
 */

import jwt from "jsonwebtoken";

const { ACCESS_TOKEN_SECRET } = process.env;

/**
 * Attaches `req.user` if JWT is valid, else 401.
 */
export function authRequired(req, res, next) {
  const hdr = (req.headers.authorization || "").trim();
  const parts = hdr.split(/\s+/);
  const token =
    parts.length === 2 && /^Bearer$/i.test(parts[0]) ? parts[1] : null;

  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    req.user = jwt.verify(token, ACCESS_TOKEN_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
