/**
 * @file Tags listing.
 */

import { TagService } from "../services/tag.service.js";

export const TagController = {
  list: async (_req, res, next) => {
    try {
      const tags = await TagService.list();
      res.json(tags);
    } catch (err) {
      next(err);
    }
  },
};
