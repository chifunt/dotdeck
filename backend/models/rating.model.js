/**
 * @file Rating helpers (thumbs up / down).
 */
import { db } from "../config/db.js";

export const RatingModel = {
  async set(userId, deckId, score) {
    await db.query(
      `INSERT INTO dotdeck_rating (user_id, deck_id, score)
       VALUES (?,?,?)
       ON DUPLICATE KEY UPDATE score = VALUES(score)`,
      [userId, deckId, score],
    );
  },

  async totals(deckId) {
    const [[row]] = await db.query(
      `SELECT
          COALESCE(SUM(score = 1),0)  AS upvotes,
          COALESCE(SUM(score = -1),0) AS downvotes
       FROM dotdeck_rating
       WHERE deck_id = ?`,
      [deckId],
    );
    return row || { upvotes: 0, downvotes: 0 };
  },

  async remove(userId, deckId) {
    const [r] = await db.query(
      "DELETE FROM dotdeck_rating WHERE user_id = ? AND deck_id = ?",
      [userId, deckId],
    );
    return r.affectedRows === 1;
  },
};
