/**
 * @file /decks route group.
 */

import { Router } from "express";
import { body, query } from "express-validator";
import { validate } from "../middleware/validate.middleware.js";
import { DeckController } from "../controllers/deck.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { ratingRouter } from "./rating.routes.js";
import { commentRouter } from "./comment.routes.js";
import { uploadImage } from "../middleware/upload.middleware.js";

export const deckRouter = Router();

deckRouter.get(
  "/",
  validate([
    query("tool").optional().isString(),
    query("tag").optional().isString(),
  ]),
  DeckController.list,
);

deckRouter.get("/:id", DeckController.detail);

deckRouter.post(
  "/",
  authRequired,
  validate([
    body("title").isLength({ min: 3 }),
    body("description").optional().isString(),
    body("thumbnailUrl").optional().isURL(),
    body("snippets").isArray({ min: 1 }),
  ]),
  DeckController.create,
);

// thumbnail upload (returns {url})
deckRouter.post("/thumbnail", authRequired, uploadImage, (req, res) =>
  res.json({ url: `/uploads/${req.file.filename}` }),
);

// nested routes: /decks/:id/ratings & /decks/:id/comments
deckRouter.use("/:id/ratings", ratingRouter);
deckRouter.use("/:id/comments", commentRouter);

deckRouter.delete("/:id", authRequired, DeckController.remove);
