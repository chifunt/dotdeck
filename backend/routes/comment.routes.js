/**
 * @file /decks/:id/comments routes – flat comment threads.
 * @tags Comments: Flat comment threads
 */

import { Router } from "express";
import { query } from "express-validator";
import { validate } from "../middleware/validate.middleware.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { CommentController } from "../controllers/comment.controller.js";

export const commentRouter = Router({ mergeParams: true });

commentRouter.get(
  "/",
  validate([
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
    query("offset").optional().isInt({ min: 0 }).toInt(),
  ]),
  CommentController.list,
);
commentRouter.post("/", authRequired, CommentController.create);
commentRouter.delete("/:commentId", authRequired, CommentController.remove);
