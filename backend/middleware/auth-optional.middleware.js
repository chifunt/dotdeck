/**
 * If a Bearer token is present → attaches req.user,
 * otherwise just calls next() without error.
 */
import jwt from "jsonwebtoken";

const { ACCESS_TOKEN_SECRET } = process.env;

/** @type {import('express').RequestHandler} */
export function authOptional(req, _res, next) {
  const hdr = (req.headers.authorization || "").trim();
  const [scheme, token] = hdr.split(/\s+/);

  if (!token || !/^Bearer$/i.test(scheme)) return next(); // public request

  try {
    req.user = jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch {
    /* bad / expired token – treat as unauthenticated */
  }
  return next();
}
