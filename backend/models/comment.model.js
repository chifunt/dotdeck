/**
 * @file Comment CRUD.
 */
import { db } from "../config/db.js";

export const CommentModel = {
  async create({ deckId, userId, body }) {
    const [r] = await db.query(
      `INSERT INTO dotdeck_comment (deck_id, user_id, body)
       VALUES (?,?,?)`,
      [deckId, userId, body],
    );
    return { id: r.insertId, deckId, userId, body };
  },

  async list(deckId, limit = 50) {
    const [rows] = await db.query(
      `SELECT c.id, c.body, c.created_at, u.username
         FROM dotdeck_comment c
         JOIN dotdeck_user u ON u.id = c.user_id
         WHERE c.deck_id = ?
         ORDER BY c.created_at DESC
         LIMIT ?`,
      [deckId, limit],
    );
    return rows;
  },
};
