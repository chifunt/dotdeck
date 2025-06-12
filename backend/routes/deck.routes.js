/**
 * @file /decks route group.
 */

/**
 * @swagger
 * tags:
 *   name: Decks
 *   description: Create, list, update, view & delete decks
 */

/**
 * @swagger
 * /decks:
 *   get:
 *     summary: List decks
 *     tags: [Decks]
 *     parameters:
 *       - in: query
 *         name: tag
 *         schema: { type: string }
 *         description: Filter by tag name
 *       - in: query
 *         name: tool
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deck array }
 *
 *   post:
 *     summary: Create a new deck
 *     security: [ bearerAuth: [] ]
 *     tags: [Decks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeckCreate'
 *     responses:
 *       201: { description: Created deck id }
 */

/**
 * @swagger
 * /decks/{id}:
 *   get:
 *     summary: Get a single deck
 *     tags: [Decks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Deck with metadata }
 *       404: { description: Not found }
 *
 *   delete:
 *     summary: Delete own deck (soft delete)
 *     security: [ bearerAuth: [] ]
 *     tags: [Decks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Deleted }
 *       404: { description: Not found }
 */

/**
 * @swagger
 * /decks/thumbnail:
 *   post:
 *     summary: Upload a thumbnail image
 *     security: [ bearerAuth: [] ]
 *     tags: [Decks]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200: { description: URL where the file is served }
 */

/**
 * @swagger
 * /decks/{id}:
 *   patch:
 *     summary: Update a deck
 *     security: [ bearerAuth: [] ]
 *     tags: [Decks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeckCreate'
 *     responses:
 *       204: { description: Updated }
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DeckCreate:
 *       type: object
 *       required: [title, snippets]
 *       properties:
 *         title: { type: string }
 *         description: { type: string }
 *         thumbnailUrl: { type: string }
 *         tags:
 *           type: array
 *           items: { type: string }
 *         snippets:
 *           type: array
 *           items:
 *             type: object
 *             required: [language, code]
 *             properties:
 *               language: { type: string }
 *               caption:  { type: string }
 *               code:     { type: string }
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

deckRouter.patch(
  "/:id",
  authRequired,
  validate([
    body("title").optional().isString().isLength({ min: 3 }),
    body("description").optional().isString(),
    body("thumbnailUrl").optional().isURL(),
    body("snippets").optional().isArray({ min: 1 }),
  ]),
  DeckController.edit,
);
