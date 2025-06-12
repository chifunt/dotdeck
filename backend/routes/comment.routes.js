/**
 * @file /decks/:id/comments routes.
 */
import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import { CommentController } from "../controllers/comment.controller.js";

export const commentRouter = Router({ mergeParams: true });

commentRouter.get("/", CommentController.list);
commentRouter.post("/", authRequired, CommentController.create);
