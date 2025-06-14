/**
 * @file /moderation route-group – moderator-only tools.
 *
 * @swagger
 * tags:
 *   name: Moderation
 *   description: Endpoints restricted to moderators and admins
 *
 * /moderation/decks/{id}/soft-delete:
 *   patch:
 *     summary: Soft-delete a deck
 *     tags: [Moderation]
 *     security: [ bearerAuth: [] ]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       204: { description: Deleted }
 *       404: { description: Not found }
 *
 * /moderation/comments/{id}/soft-delete:
 *   patch:
 *     summary: Soft-delete a comment
 *     tags: [Moderation]
 *     security: [ bearerAuth: [] ]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       204: { description: Deleted }
 *       404: { description: Not found }
 */

import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import { modRequired } from "../middleware/role.middleware.js";
import { DeckModel } from "../models/deck.model.js";
import { CommentModel } from "../models/comment.model.js";
import { Audit } from "../utils/audit.util.js";

export const moderationRouter = Router();

/* soft-delete deck */
moderationRouter.patch(
  "/decks/:id/soft-delete",
  authRequired,
  modRequired,
  async (req, res, next) => {
    try {
      const ok = await DeckModel.softDelete(req.params.id, /* userId = */ null);
      if (ok)
        await Audit.log(
          req.user.id,
          "soft_delete_deck",
          "dotdeck_deck",
          req.params.id,
        );
      res.status(ok ? 204 : 404).end();
    } catch (e) {
      next(e);
    }
  },
);

/* soft-delete comment */
moderationRouter.patch(
  "/comments/:id/soft-delete",
  authRequired,
  modRequired,
  async (req, res, next) => {
    try {
      const ok = await CommentModel.softDelete(
        req.params.id,
        /* userId = */ null,
      );
      if (ok)
        await Audit.log(
          req.user.id,
          "soft_delete_comment",
          "dotdeck_comment",
          req.params.id,
        );
      res.status(ok ? 204 : 404).end();
    } catch (e) {
      next(e);
    }
  },
);
