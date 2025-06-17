/**
 * @file Deck CRUD & fetch helpers.
 */

import { db } from "../config/db.js";

export const DeckModel = {
  async create(deck, conn = db) {
    const [r] = await conn.query(
      `INSERT INTO dotdeck_deck
        (user_id, title, slug, description, thumbnail_url)
        VALUES (?,?,?,?,?)`,
      [deck.userId, deck.title, deck.slug, deck.description, deck.thumbnailUrl],
    );
    return r.insertId;
  },

  async getAll({ tool, tag, q, limit = 20, offset = 0 }) {
    const params = [];
    let joinSql = "";
    let whereSql = "WHERE d.deleted_at IS NULL";

    if (tool || tag) {
      joinSql = `
        JOIN dotdeck_deck_tag dt ON d.id = dt.deck_id
        JOIN dotdeck_tag      t  ON t.id = dt.tag_id`;
      whereSql += " AND t.name = ?";
      params.push(tool ?? tag);
    }

    if (q) {
      whereSql += " AND (d.title LIKE ? OR d.description LIKE ?)";
      const like = `%${q}%`;
      params.push(like, like);
    }

    params.push(limit, offset);

    // 1. data slice
    const [rows] = await db.query(
      `SELECT d.*, u.username
         FROM dotdeck_deck d
         JOIN dotdeck_user u ON u.id = d.user_id
         ${joinSql}
         ${whereSql}
       ORDER BY d.created_at DESC
       LIMIT ? OFFSET ?`,
      params,
    );

    // 2. total for the current filter set
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total
         FROM dotdeck_deck d
         ${joinSql}
         ${whereSql.split("LIMIT")[0]}`, // remove LIMIT clause
      params.slice(0, params.length - 2), // drop limit/offset
    );

    return { data: rows, total };
  },

  async getById(id) {
    const [[deck]] = await db.query(
      `SELECT d.*, u.username
       FROM dotdeck_deck d
       JOIN dotdeck_user u ON u.id = d.user_id
       WHERE d.id = ? AND d.deleted_at IS NULL`,
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

  async update(id, userId, fields, conn = db) {
    const sets = [];
    const vals = [];
    if (fields.title) {
      sets.push("title = ?");
      vals.push(fields.title);
    }
    if (fields.description) {
      sets.push("description = ?");
      vals.push(fields.description);
    }
    if (fields.thumbnailUrl) {
      sets.push("thumbnail_url = ?");
      vals.push(fields.thumbnailUrl);
    }
    if (fields.slug) {
      sets.push("slug = ?");
      vals.push(fields.slug);
    }
    if (fields.snippets) {
      /* handled in service ↓ */
    }

    if (!sets.length && !fields.snippets) return false;

    if (sets.length) {
      vals.push(id, userId);
      await conn.query(
        `UPDATE dotdeck_deck SET ${sets.join(", ")}, updated_at = NOW()
         WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
        vals,
      );
    }
    return true;
  },

  async softDelete(id, userId) {
    const params = [id];
    let whereUser = "";
    if (userId === undefined) {
      throw new Error(
        "softDelete(): userId must be passed (null for moderator/admin routes)",
      );
    }
    if (userId !== null && userId !== undefined) {
      whereUser = " AND user_id = ?";
      params.push(userId);
    }
    const [r] = await db.query(
      `UPDATE dotdeck_deck
         SET deleted_at = NOW()
       WHERE id = ?${whereUser} AND deleted_at IS NULL`,
      params,
    );
    return r.affectedRows === 1;
  },

  async getBySlug(slug) {
    const [[deck]] = await db.query(
      `SELECT d.*, u.username
         FROM dotdeck_deck d
         JOIN dotdeck_user u ON u.id = d.user_id
        WHERE d.slug = ? AND d.deleted_at IS NULL`,
      [slug],
    );
    return deck;
  },

  /**
   * List decks created by a user (non-deleted).
   * @param {number} userId
   * @param {{limit?:number,offset?:number}} param1
   */
  async getByUser(userId, { limit = 20, offset = 0 } = {}) {
    const [rows] = await db.query(
      `SELECT id,
              title,
              slug,
              description,
              thumbnail_url AS thumbnailUrl,
              created_at     AS createdAt
         FROM dotdeck_deck
        WHERE user_id = ? AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?`,
      [userId, limit, offset],
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total
         FROM dotdeck_deck
        WHERE user_id = ? AND deleted_at IS NULL`,
      [userId],
    );
    return { data: rows, total };
  },
};
