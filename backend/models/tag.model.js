/**
 * @file Tag fetch helpers.
 */

import { db } from "../config/db.js";

/**
 * Insert a new tag (admin-only call path).
 *
 * @param {string} name
 * @param {number} tagType  – FK to dotdeck_tag_type.id
 * @returns {Promise<import('mysql2').OkPacket>}
 */
async function create(name, tagType) {
  return db.query("INSERT INTO dotdeck_tag (name, tag_type) VALUES (?,?)", [
    name,
    tagType,
  ]);
}

export const TagModel = { all, create };
