/**
 * @file /decks/:id/ratings routes – thumbs-up / thumbs-down votes.
 * @tags Ratings: Thumbs-up / thumbs-down votes
 */

import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import { authOptional } from "../middleware/auth-optional.middleware.js";
import { RatingController } from "../controllers/rating.controller.js";

export const ratingRouter = Router({ mergeParams: true }); // inherit :id

ratingRouter.post("/", authRequired, RatingController.vote); // 👍👎
ratingRouter.get("/", authOptional, RatingController.totals); // counts (+myVote)
ratingRouter.delete("/", authRequired, RatingController.unvote); // 🚫
