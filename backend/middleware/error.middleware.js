/**
 * @file Catch-all error handler (last middleware).
 */
/* eslint-disable no-unused-vars */
export function errorHandler(err, req, res, _next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Server error" });
}
