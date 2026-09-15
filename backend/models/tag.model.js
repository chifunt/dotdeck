/**
 * @file Tag model – DB helpers for dotdeck_tag (+ tag_type join when needed).
 */

import { db } from "../config/db.js";

/**
 * Tag-related DB helpers.
 * @namespace TagModel
 */
export const TagModel = {
  /**
   * List every tag with its type name.
   *
   * @returns {Promise<Array<{
   *   id:number,
   *   name:string,
   *   tagType:number,
   *   tagTypeName:string
   * }>>}
   */
  async all() {
    const [rows] = await db.query(
      `SELECT t.id,
              t.name,
              t.tag_type      AS tagType,
              t.is_official   AS isOfficial,
              tt.name         AS tagTypeName
         FROM dotdeck_tag        t
         LEFT JOIN dotdeck_tag_type   tt ON tt.id = t.tag_type
         ORDER BY tt.id, t.name`,
    );
    return rows;
  },

  /**
   * Insert a new tag (admin-only call path).
   *
   * @param {string} name
   * @param {number} tagType – FK → dotdeck_tag_type.id
   * @returns {Promise<import('mysql2').OkPacket>}
   */
  async create(name, tagType) {
    return db.query("INSERT INTO dotdeck_tag (name, tag_type) VALUES (?,?)", [
      name,
      tagType,
    ]);
  },

  /**
   * List tags associated with a given deck.
   * @param {number} deckId
   * @returns {Promise<Array<{id:number,name:string}>>}
   */
  async getByDeck(deckId) {
    const [rows] = await db.query(
      `SELECT t.id, t.name
         FROM dotdeck_tag t
         JOIN dotdeck_deck_tag dt ON dt.tag_id = t.id
        WHERE dt.deck_id = ?
        ORDER BY t.name`,
      [deckId],
    );
    return rows;
  },

  /**
   * Fetch by exact name.
   * @param {string} name
   */
  async findByName(name, conn = db) {
    const [[row]] = await conn.query(
      "SELECT * FROM dotdeck_tag WHERE name = ? LIMIT 1",
      [name],
    );
    return row;
  },

  /**
   * Create an **unofficial** tag (used at deck-submit time).
   * @param {string} name
   * @returns {Promise<number>} tagId
   */
  async createUnofficial(name, conn = db) {
    // Resolve a duplicate name without suppressing validation/storage errors.
    const [result] = await conn.query(
      `INSERT INTO dotdeck_tag (name, is_official, tag_type) VALUES (?,0,NULL)
       ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
      [name],
    );
    return result.insertId;
  },

  /** Mark tag as official (admin). */
  async approve(id) {
    await db.query("UPDATE dotdeck_tag SET is_official = 1 WHERE id = ?", [id]);
  },

  /**
   * Merge two tags → keeps *target*, moves deck references, deletes source.
   */
  async merge(sourceId, targetId, conn = db) {
    await conn.beginTransaction();
    try {
      await conn.query(
        "UPDATE IGNORE dotdeck_deck_tag SET tag_id = ? WHERE tag_id = ?",
        [targetId, sourceId],
      );
      await conn.query("DELETE FROM dotdeck_tag WHERE id = ?", [sourceId]);
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    }
  },
};
