/**
 * @file Business logic for permanent user bans / unbans.
 *
 * Public methods:
 *   • BanService.ban(userId, actorId, reason?)
 *   • BanService.unban(userId, actorId)
 *
 * Side-effects:
 *   • Marks user as banned
 *   • Soft-deletes all their decks
 *   • Removes their votes
 *   • Records reason in dotdeck_user_ban
 *   • Emits audit rows
 */

import { db } from "../config/db.js";
import { Audit } from "../utils/audit.util.js";

export const BanService = {
  async ban(userId, actorId, reason = null) {
    await db.getConnection().then(async (conn) => {
      try {
        await conn.beginTransaction();

        /* 1. flag user */
        await conn.query(
          "UPDATE dotdeck_user SET banned_at = NOW() WHERE id = ? AND banned_at IS NULL",
          [userId],
        );

        /* 2. soft-delete user decks */
        await conn.query(
          "UPDATE dotdeck_deck SET deleted_at = NOW() WHERE user_id = ? AND deleted_at IS NULL",
          [userId],
        );

        /* 3. remove ratings so totals recalc */
        await conn.query("DELETE FROM dotdeck_rating WHERE user_id = ?", [
          userId,
        ]);

        /* 4. record reason */
        await conn.query(
          `REPLACE INTO dotdeck_user_ban (user_id, actor_id, reason)
           VALUES (?,?,?)`,
          [userId, actorId, reason],
        );

        await Audit.log(actorId, "ban_user", "dotdeck_user", userId, {
          reason,
        });
        await conn.commit();
      } catch (e) {
        await conn.rollback();
        throw e;
      } finally {
        conn.release();
      }
    });
  },

  async unban(userId, actorId) {
    await db.query("UPDATE dotdeck_user SET banned_at = NULL WHERE id = ?", [
      userId,
    ]);
    await db.query("DELETE FROM dotdeck_user_ban WHERE user_id = ?", [userId]);
    await Audit.log(actorId, "unban_user", "dotdeck_user", userId);
  },
};
