/**
 * @file Lightweight audit-trail helper.
 * @see /migrations/2024-03-add-roles-bans-audit.sql
 */

import { db } from "../config/db.js";

/**
 * Centralised audit logger.
 */
export const Audit = {
  /**
   * Log a moderation / admin event.
   *
   * @param {number} actorId      – user performing the action
   * @param {string} action       – machine-friendly descriptor (snake_case)
   * @param {string} targetTable  – e.g. "dotdeck_deck"
   * @param {number|null} targetId
   * @param {Record<string,any>|null} meta
   * @returns {Promise<void>}
   */
  async log(
    actorId,
    action,
    targetTable,
    targetId = null,
    meta = null,
    conn = db,
  ) {
    await conn.query(
      `INSERT INTO dotdeck_audit
         (actor_id, action, target_table, target_id, meta)
       VALUES (?,?,?,?,?)`,
      [
        actorId,
        action,
        targetTable,
        targetId,
        meta ? JSON.stringify(meta) : null,
      ],
    );
  },
};
