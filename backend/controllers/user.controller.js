/**
 * @file Public user-profile controller.
 */

import slugify from "slugify";
import { UserModel } from "../models/user.model.js";
import { DeckModel } from "../models/deck.model.js";

export const UserController = {
  /**
   * GET /users/:username
   * Returns user (public fields) + paged deck list.
   */
  async profile(req, res, next) {
    try {
      const { username } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      const user = await UserModel.findByUsername(username);
      if (!user) return res.status(404).json({ message: "User not found" });

      const { data, total } = await DeckModel.getByUser(user.id, {
        limit,
        offset,
      });

      return res.json({
        user: {
          id: user.id,
          username: user.username,
          slug: slugify(user.username, { lower: true, strict: true }),
        },
        decks: {
          data,
          paging: { limit, offset, total },
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
