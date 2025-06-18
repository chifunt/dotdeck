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

  /**
   * @param {number} deckId
   * @param {number|null} [userId] – pass null/undefined for public request
   */
  async totals(deckId, userId = null) {
    const [[row]] = await db.query(
      `SELECT
        COALESCE(SUM(score = 1),0)  AS upvotes,
        COALESCE(SUM(score = -1),0) AS downvotes,
        COALESCE(
          MAX(CASE WHEN user_id = ? THEN score END), 0
        ) AS myVote
     FROM dotdeck_rating
     WHERE deck_id = ?`,
      [userId ?? 0, deckId], // 0 → never matches any user_id, gives 0
    );
    return row || { upvotes: 0, downvotes: 0, myVote: 0 };
  },

  async remove(userId, deckId) {
    const [r] = await db.query(
      "DELETE FROM dotdeck_rating WHERE user_id = ? AND deck_id = ?",
      [userId, deckId],
    );
    return r.affectedRows === 1;
  },
};
