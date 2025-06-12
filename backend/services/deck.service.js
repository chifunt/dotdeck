/**
 * @file Orchestrates Deck create & fetch with tags and snippets.
 */

import slugify from "slugify";
import { db } from "../config/db.js";
import { DeckModel } from "../models/deck.model.js";

export const DeckService = {
  /**
   * Create a deck + its code snippets + tags in one transaction.
   * @param {object} payload
   * @param {number} userId
   * @returns {Promise<number>} deckId
   */
  async create(payload, userId) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const deckId = await DeckModel.create(
        {
          userId,
          title: payload.title,
          description: payload.description,
          thumbnailUrl: payload.thumbnailUrl,
        },
        conn,
      );

      // --- code snippets
      for (const [idx, s] of payload.snippets.entries()) {
        await conn.query(
          `INSERT INTO dotdeck_code_snippet
             (deck_id, language, caption, code, sort_order)
           VALUES (?,?,?,?,?)`,
          [deckId, s.language, s.caption, s.code, idx],
        );
      }

      // --- tags
      if (payload.tags?.length) {
        const [rows] = await conn.query(
          "SELECT id FROM dotdeck_tag WHERE name IN (?)",
          [payload.tags],
        );
        const tagIds = rows.map((r) => r.id);
        const values = tagIds.map((id) => [deckId, id]);
        await conn.query(
          "INSERT IGNORE INTO dotdeck_deck_tag (deck_id, tag_id) VALUES ?",
          [values],
        );
      }

      await conn.commit();
      return deckId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};
