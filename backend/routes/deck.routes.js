/**
 * @file /decks route group.
 */

import { Router } from "express";
import { body, query } from "express-validator";
import { validate } from "../middleware/validate.middleware.js";
import { DeckController } from "../controllers/deck.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";

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

deckRouter.delete("/:id", authRequired, DeckController.remove);
