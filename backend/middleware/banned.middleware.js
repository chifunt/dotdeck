/**
 * @file Reject requests from permanently-banned users.
 *
 * Must be placed *after* authRequired so req.user exists.
 */

import { db } from "../config/db.js";

/** @type {import('express').RequestHandler} */
export async function bannedGuard(req, res, next) {
  try {
    // Public / unauthenticated request → just continue.
    if (!req.user) return next();

    const [[row]] = await db.query(
      "SELECT banned_at FROM dotdeck_user WHERE id = ? LIMIT 1",
      [req.user.id],
    );

    if (row?.banned_at) {
      return res.status(403).json({ message: "Account banned" });
    }

    return next();
  } catch (err) {
    return next(err);
  }
}
