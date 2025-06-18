/**
 * @file Deck HTTP handlers.
 */

import { DeckModel } from "../models/deck.model.js";
import { DeckService } from "../services/deck.service.js";

export const DeckController = {
  list: async (req, res, next) => {
    try {
      // unpack validated query params (they’re already integers thanks to .toInt())
      const { limit = 20, offset = 0, tag, tool, q } = req.query;

      const { data, total } = await DeckModel.getAll({
        tool,
        tag,
        q,
        limit,
        offset,
      });

      // map each row into { …deckFields, author: { id, username } }
      const decksWithAuthor = data.map((d) => ({
        id: d.id,
        title: d.title,
        slug: d.slug,
        description: d.description,
        thumbnailUrl: d.thumbnailUrl,
        createdAt: d.createdAt,
        author: {
          id: d.authorId,
          username: d.authorUsername,
        },
      }));

      res.json({
        data: decksWithAuthor,
        paging: { limit, offset, total },
      });
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const deckId = await DeckService.create(req.body, req.user.id);
      res.status(201).json({ id: deckId });
    } catch (err) {
      next(err);
    }
  },

  detail: async (req, res, next) => {
    try {
      const deck = await DeckModel.getById(req.params.id);
      if (!deck) return res.status(404).json({ message: "Deck not found" });
      res.json(deck);
    } catch (err) {
      next(err);
    }
  },

  detailBySlug: async (req, res, next) => {
    try {
      const deck = await DeckModel.getBySlug(req.params.slug);
      if (!deck) return res.status(404).json({ message: "Deck not found" });
      res.json(deck);
    } catch (err) {
      next(err);
    }
  },

  edit: async (req, res, next) => {
    try {
      await DeckService.update(req.params.id, req.user.id, req.body);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },

  remove: async (req, res, next) => {
    try {
      const ok = await DeckModel.softDelete(req.params.id, req.user.id);
      res.status(ok ? 204 : 404).end();
    } catch (err) {
      next(err);
    }
  },
};
