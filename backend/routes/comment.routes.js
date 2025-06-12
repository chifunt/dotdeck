/**
 * @file /decks/:id/comments routes.
 */

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Flat comment threads
 */

/**
 * @swagger
 * /decks/{id}/comments:
 *   get:
 *     summary: List comments for a deck
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Comment array }
 *
 *   post:
 *     summary: Add a comment
 *     security: [ bearerAuth: [] ]
 *     tags: [Comments]
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
 *             type: object
 *             required: [body]
 *             properties:
 *               body: { type: string }
 *     responses:
 *       201: { description: The created comment }
 */

import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import { CommentController } from "../controllers/comment.controller.js";

export const commentRouter = Router({ mergeParams: true });

commentRouter.get("/", CommentController.list);
commentRouter.post("/", authRequired, CommentController.create);
