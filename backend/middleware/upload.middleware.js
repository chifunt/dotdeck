/**
 * @file Multer config – single image upload to /uploads.
 * Exposes req.file { filename, path, mimetype, size }
 */
import multer from "multer";
import { join, extname } from "node:path";
import { randomUUID } from "node:crypto";

const UPLOAD_DIR = join(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const id = randomUUID();
    cb(null, `${id}${extname(file.originalname)}`);
  },
});

export const uploadImage = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (_req, file, cb) => {
    cb(null, /^image\/(jpe?g|png|gif|webp)$/.test(file.mimetype));
  },
}).single("image"); // field name expected from client
