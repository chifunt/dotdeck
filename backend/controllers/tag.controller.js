/**
 * @file Tags listing.
 */

import { TagService } from "../services/tag.service.js";
import { TagModel } from "../models/tag.model.js";

export const TagController = {
  list: async (req, res, next) => {
    try {
      const tags =
        req.query.all === "1"
          ? await TagModel.all()
          : await TagService.listOfficial();
      res.json(tags);
    } catch (err) {
      next(err);
    }
  },
};
