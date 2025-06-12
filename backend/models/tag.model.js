/**
 * @file Tag fetch helpers.
 */

import { db } from "../config/db.js";

export const TagModel = {
  async all() {
    const [rows] = await db.query(
      `SELECT t.id, t.name, tt.name AS tag_type
         FROM dotdeck_tag t
         JOIN dotdeck_tag_type tt ON tt.id = t.tag_type
         ORDER BY t.name`,
    );
    return rows;
  },
};
