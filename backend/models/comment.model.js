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

  async list(deckId, { limit = 50, offset = 0 }) {
    const [rows] = await db.query(
      `SELECT c.id, c.body, c.created_at, u.username
         FROM dotdeck_comment c
         JOIN dotdeck_user u ON u.id = c.user_id
        WHERE c.deck_id = ? AND c.deleted_at IS NULL
        ORDER BY c.created_at DESC
        LIMIT ? OFFSET ?`,
      [deckId, limit, offset],
    );
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total
         FROM dotdeck_comment
        WHERE deck_id = ? AND deleted_at IS NULL`,
      [deckId],
    );
    return { data: rows, total };
  },

  async softDelete(id, userId) {
    const params = [id];
    let whereUser = "";
    if (userId !== null && userId !== undefined) {
      whereUser = " AND user_id = ?";
      params.push(userId);
    }
    const [r] = await db.query(
      `UPDATE dotdeck_comment
        SET deleted_at = NOW()
      WHERE id = ?${whereUser} AND deleted_at IS NULL`,
      params,
    );
    return r.affectedRows === 1;
  },
};
