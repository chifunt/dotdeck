/**
 * @file /decks/:id/comments routes – flat comment threads.
 * @tags Comments: Flat comment threads
 */

import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import { CommentController } from "../controllers/comment.controller.js";

export const commentRouter = Router({ mergeParams: true });

commentRouter.get("/", CommentController.list);
commentRouter.post("/", authRequired, CommentController.create);
commentRouter.delete("/:commentId", authRequired, CommentController.remove);
