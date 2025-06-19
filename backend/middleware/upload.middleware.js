/**
 * @fileoverview Multer + Sharp middleware for single image upload.
 * Accepts image via `multipart/form-data`, converts it to WebP, and saves to /uploads.
 * Exposes `req.file` with updated { filename, path, mimetype, size }.
 */

import express from "express";
import multer from "multer";
import sharp from "sharp";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import createHttpError from "http-errors";

const app = express();

// ─────────────────────────────────────────
// Config
// ─────────────────────────────────────────

/** @constant {string} Absolute path to the upload directory */
const UPLOAD_DIR = join(process.cwd(), "uploads");
if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });

/** @constant {number} Maximum allowed upload size in bytes (2 MB) */
const MAX_SIZE = 10 * 1024 * 1024;

/** @constant {RegExp} Allowed MIME types for image upload (GIF removed) */
const ALLOWED = /^image\/(jpe?g|png|webp|heic|heif)$/;

// ─────────────────────────────────────────
// Multer (memory storage) → Sharp pipeline
// ─────────────────────────────────────────

/**
 * Multer middleware to handle single image upload into memory.
 * @type {import('express').RequestHandler}
 */
const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    try {
      if (ALLOWED.test(file.mimetype)) return cb(null, true);

      // Use MulterError so Express recognises it straight away
      const err = new multer.MulterError("LIMIT_UNEXPECTED_FILE");
      err.message = "Invalid file type";
      return cb(err, false);
    } catch (err) {
      return cb(err, false);
    }
  },
}).single("image");

/**
 * Middleware to handle image upload and processing.
 *
 * Workflow:
 * 1. Multer parses `multipart/form-data` and stores file in memory.
 * 2. Sharp re-encodes image to WebP format and saves it to disk.
 * 3. `req.file` is updated with the final filename, path, and mimetype.
 *
 * @type {import('express').RequestHandler[]}
 */
export const uploadImage = [
  multerUpload,
  /**
   * @type {import('express').RequestHandler}
   */
  async (req, _res, next) => {
    try {
      if (!req.file) return next();

      const id = randomUUID();
      const filename = `${id}.webp`;
      const outPath = join(UPLOAD_DIR, filename);

      await sharp(req.file.buffer)
        .rotate() // autorotate based on EXIF orientation
        .webp({ quality: 85 }) // convert and compress
        .toFile(outPath); // save to disk

      // Extend req.file to include output info
      req.file.filename = filename;
      req.file.path = outPath;
      req.file.mimetype = "image/webp";

      return next();
    } catch (err) {
      err.status = 400;
      return next(err);
    }
  },
];

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // e.g. err.code === 'LIMIT_FILE_SIZE' or 'LIMIT_UNEXPECTED_FILE'
    return res
      .status(400)
      .json({ error: err.message || "Invalid file upload" });
  }
  // propagate other http-errors
  if (createHttpError.isHttpError(err)) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  // fallback to generic 500
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});
