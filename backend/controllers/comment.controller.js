/**
 * @file Comment endpoints.
 */
import { CommentModel } from "../models/comment.model.js";

export const CommentController = {
  async list(req, res, next) {
    try {
      const comments = await CommentModel.list(req.params.id);
      res.json(comments);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      if (!req.body.body || req.body.body.trim().length === 0)
        return res.status(422).json({ message: "Body required" });

      const comment = await CommentModel.create({
        deckId: req.params.id,
        userId: req.user.id,
        body: req.body.body.trim(),
      });
      res.status(201).json(comment);
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const ok = await CommentModel.softDelete(
        req.params.commentId,
        req.user.id,
      );
      res.status(ok ? 204 : 404).end();
    } catch (err) {
      next(err);
    }
  },
};
