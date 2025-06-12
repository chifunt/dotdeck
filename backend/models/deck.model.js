/**
 * @file Deck CRUD & fetch helpers.
 */

import { db } from "../config/db.js";

export const DeckModel = {
  async create(deck, conn = db) {
    const [r] = await conn.query(
      `INSERT INTO dotdeck_deck
       (user_id, title, description, thumbnail_url)
       VALUES (?,?,?,?)`,
      [deck.userId, deck.title, deck.description, deck.thumbnailUrl],
    );
    return r.insertId;
  },

  async getAll({ tool, tag, limit = 20, offset = 0 }) {
    const params = [];
    let filterSql = "";

    if (tool) {
      filterSql +=
        " JOIN dotdeck_deck_tag dt ON d.id = dt.deck_id JOIN dotdeck_tag t ON t.id = dt.tag_id";
      filterSql += " AND t.name = ?";
      params.push(tool);
    } else if (tag) {
      filterSql +=
        " JOIN dotdeck_deck_tag dt ON d.id = dt.deck_id JOIN dotdeck_tag t ON t.id = dt.tag_id";
      filterSql += " AND t.name = ?";
      params.push(tag);
    }

    params.push(limit, offset);

    const [rows] = await db.query(
      `SELECT d.*, u.username
       FROM dotdeck_deck d
       JOIN dotdeck_user u ON u.id = d.user_id
       ${filterSql ? "WHERE 1=1" + filterSql : ""}
       ORDER BY d.created_at DESC
       LIMIT ? OFFSET ?`,
      params,
    );

    return rows;
  },

  async getById(id) {
    const [[deck]] = await db.query(
      `SELECT d.*, u.username
       FROM dotdeck_deck d
       JOIN dotdeck_user u ON u.id = d.user_id
       WHERE d.id = ?`,
      [id],
    );
    return deck;
  },

  async delete(id, userId) {
    const [r] = await db.query(
      "DELETE FROM dotdeck_deck WHERE id = ? AND user_id = ?",
      [id, userId],
    );
    return r.affectedRows === 1;
  },
};
