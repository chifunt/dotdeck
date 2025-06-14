/**
 * @file /decks route-group – create, list, update, view & delete decks.
 * @tags Decks: Deck management (CRUD)
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

deckRouter.get("/:id(\\d+)", DeckController.detail); // numeric id
deckRouter.get("/slug/:slug", DeckController.detailBySlug); // pretty slug

deckRouter.post(
  "/",
  authRequired,
  validate([
    body("title").isLength({ min: 3 }),
    body("description").optional().isString(),
    body("thumbnailUrl").optional().isURL(),
    body("snippets")
      .isArray({ min: 1 })
      .withMessage("snippets must be a non-empty array"),
    // per-item checks ↓
    body("snippets.*.language")
      .isString()
      .bail()
      .notEmpty()
      .withMessage("language is required for each snippet"),
    body("snippets.*.code")
      .isString()
      .bail()
      .notEmpty()
      .withMessage("code is required for each snippet"),
    body("snippets.*.caption").optional().isString(),
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

deckRouter.patch(
  "/:id",
  authRequired,
  validate([
    body("title").optional().isString().isLength({ min: 3 }),
    body("description").optional().isString(),
    body("thumbnailUrl").optional().isURL(),
    body("snippets").optional().isArray({ min: 1 }),
    body("snippets")
      .optional()
      .isArray({ min: 1 })
      .withMessage("snippets, if provided, must be a non-empty array"),
    body("snippets.*.language").optional().isString().notEmpty(),
    body("snippets.*.code").optional().isString().notEmpty(),
    body("snippets.*.caption").optional().isString(),
  ]),
  DeckController.edit,
);
