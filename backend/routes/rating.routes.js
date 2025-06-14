/**
 * @file /decks/:id/ratings routes – thumbs-up / thumbs-down votes.
 * @tags Ratings: Thumbs-up / thumbs-down votes
 */

import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import { RatingController } from "../controllers/rating.controller.js";

export const ratingRouter = Router({ mergeParams: true }); // inherit :id

ratingRouter.post("/", authRequired, RatingController.vote); // vote 👍👎
ratingRouter.get("/", RatingController.totals); // totals
ratingRouter.delete("/", authRequired, RatingController.unvote); // 🚫
