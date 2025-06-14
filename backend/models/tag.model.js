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
              tt.name         AS tagTypeName
         FROM dotdeck_tag        t
         JOIN dotdeck_tag_type   tt ON tt.id = t.tag_type
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
};
