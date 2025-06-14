/**
 * @file Simple passthrough for tags (could hold caching later).
 */
import { TagModel } from "../models/tag.model.js";

export const TagService = {
  /** Public list – **official only** (for autocomplete). */
  async listOfficial() {
    return TagModel.all().then((rows) => rows.filter((t) => t.isOfficial));
  },

  /**
   * Ensure all submitted tag names exist, creating unofficial ones as needed.
   * Returns an array of tag IDs.
   */
  async ensureTags(names) {
    const ids = [];
    for (const name of names) {
      const existing = await TagModel.findByName(name);
      ids.push(existing ? existing.id : await TagModel.createUnofficial(name));
    }
    return ids;
  },

  /** Admin actions */
  approve: TagModel.approve,
  merge: TagModel.merge,
};
