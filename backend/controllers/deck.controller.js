/**
 * @file Deck HTTP handlers.
 */

import { DeckModel } from "../models/deck.model.js";
import { DeckService } from "../services/deck.service.js";

export const DeckController = {
  list: async (req, res, next) => {
    try {
      const decks = await DeckModel.getAll(req.query);
      res.json(decks);
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

  remove: async (req, res, next) => {
    try {
      const ok = await DeckModel.delete(req.params.id, req.user.id);
      res.status(ok ? 204 : 404).end();
    } catch (err) {
      next(err);
    }
  },
};
