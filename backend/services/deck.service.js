/**
 * @file Orchestrates Deck create & fetch with tags and snippets.
 */

import slugify from "slugify";
import { db } from "../config/db.js";
import { DeckModel } from "../models/deck.model.js";
import { TagService } from "./tag.service.js";

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

      const slugBase = slugify(payload.title, { lower: true, strict: true });
      let slug = slugBase;
      let i = 0;
      /* eslint-disable no-await-in-loop */
      while (true) {
        const [[row]] = await conn.query(
          "SELECT 1 FROM dotdeck_deck WHERE slug = ? LIMIT 1",
          [slug],
        );
        if (!row) break;
        i += 1;
        slug = `${slugBase}-${i}`;
      }

      let deckId;
      /* eslint-disable no-constant-condition */
      while (true) {
        try {
          deckId = await DeckModel.create(
            {
              userId,
              title: payload.title,
              slug,
              description: payload.description,
              thumbnailUrl: payload.thumbnailUrl,
            },
            conn,
          );
          break; // ✅ success
        } catch (e) {
          if (e.code === "ER_DUP_ENTRY") {
            // slug collision → try slug-N
            i += 1;
            slug = `${slugBase}-${i}`;
            continue;
          }
          throw e; // real error
        }
      }

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
      if (payload.tags) {
        if (payload.tags.length > 25)
          throw new Error("Maximum 25 tags per deck");
        const tagIds = await TagService.ensureTags(payload.tags);
        await conn.query("DELETE FROM dotdeck_deck_tag WHERE deck_id = ?", [
          deckId,
        ]);
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
  async update(deckId, userId, payload) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // 1. update scalar fields (+new slug if title changed)
      if (payload.title) {
        const slugBase = slugify(payload.title, { lower: true, strict: true });
        let slug = slugBase;
        let i = 0;
        while (true) {
          const [[row]] = await conn.query(
            "SELECT 1 FROM dotdeck_deck WHERE slug = ? AND id <> ? LIMIT 1",
            [slug, deckId],
          );
          if (!row) break;
          i += 1;
          slug = `${slugBase}-${i}`;
        }
        payload.slug = slug; // pass to model.update
      }

      await DeckModel.update(deckId, userId, payload, conn);

      // 2. replace snippets if provided
      if (payload.snippets) {
        await conn.query("DELETE FROM dotdeck_code_snippet WHERE deck_id = ?", [
          deckId,
        ]);
        for (const [idx, s] of payload.snippets.entries()) {
          await conn.query(
            `INSERT INTO dotdeck_code_snippet
               (deck_id, language, caption, code, sort_order)
             VALUES (?,?,?,?,?)`,
            [deckId, s.language, s.caption, s.code, idx],
          );
        }
      }

      // 3. replace TAGS if provided
      if (payload.tags) {
        if (payload.tags.length > 25) {
          throw new Error("Maximum 25 tags per deck");
        }
        const tagIds = await TagService.ensureTags(payload.tags);
        await conn.query("DELETE FROM dotdeck_deck_tag WHERE deck_id = ?", [
          deckId,
        ]);
        if (tagIds.length) {
          const values = tagIds.map((id) => [deckId, id]);
          await conn.query(
            "INSERT IGNORE INTO dotdeck_deck_tag (deck_id, tag_id) VALUES ?",
            [values],
          );
        }
      }

      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};
