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

/**
 * @swagger
 * /decks/{id}/comments/{commentId}:
 *   delete:
 *     summary: Delete my comment (soft delete)
 *     security: [ bearerAuth: [] ]
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id          # deck id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: commentId   # comment id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Deleted }
 *       404: { description: Not found }
 */

import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import { CommentController } from "../controllers/comment.controller.js";

export const commentRouter = Router({ mergeParams: true });

commentRouter.get("/", CommentController.list);
commentRouter.post("/", authRequired, CommentController.create);
commentRouter.delete("/:commentId", authRequired, CommentController.remove);
