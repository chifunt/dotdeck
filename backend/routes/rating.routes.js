/**
 * @file /decks/:id/ratings routes.
 */

/**
 * @swagger
 * tags:
 *   name: Ratings
 *   description: Thumbs-up / thumbs-down
 */

/**
 * @swagger
 * /decks/{id}/ratings:
 *   post:
 *     summary: Vote on a deck
 *     security: [ bearerAuth: [] ]
 *     tags: [Ratings]
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
 *             properties:
 *               score:
 *                 type: integer
 *                 enum: [1,-1]
 *     responses:
 *       200: { description: Vote totals }
 *
 *   get:
 *     summary: Get up/down counts
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Totals object }
 */

import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import { RatingController } from "../controllers/rating.controller.js";

export const ratingRouter = Router({ mergeParams: true }); // inherit :id

ratingRouter.post("/", authRequired, RatingController.vote); // vote
ratingRouter.get("/", RatingController.totals); // totals
