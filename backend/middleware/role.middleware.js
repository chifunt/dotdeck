/**
 * @file Role–based auth gates.
 *
 * Re-exports two Express middleware helpers:
 *  • `modRequired`   – 403 unless the JWT role is `"mod"` or `"admin"`.
 *  • `adminRequired` – 403 unless the JWT role is `"admin"`.
 *
 * @example
 *   import { modRequired } from "../middleware/role.middleware.js";
 *   router.delete("/posts/:id", authRequired, modRequired, handler);
 */

/**
 * @typedef {import("express").Request}  Request
 * @typedef {import("express").Response} Response
 * @typedef {import("express").NextFunction} NextFunction
 */

export const modRequired = (
  /** @type {Request} */ req,
  /** @type {Response} */ res,
  /** @type {NextFunction} */ next,
) => {
  const r = req.user?.role;
  return r === "mod" || r === "admin"
    ? next()
    : res.status(403).json({ message: "Moderator privilege required" });
};

export const adminRequired = (req, res, next) =>
  req.user?.role === "admin"
    ? next()
    : res.status(403).json({ message: "Admin privilege required" });
