/**
 * @file Rating endpoints.
 */
import { RatingModel } from "../models/rating.model.js";

export const RatingController = {
  async vote(req, res, next) {
    try {
      const { score } = req.body; // expect 1 or -1
      if (![1, -1].includes(score))
        return res.status(422).json({ message: "Score must be 1 or -1" });

      await RatingModel.set(req.user.id, req.params.id, score);
      const totals = await RatingModel.totals(req.params.id);
      res.json(totals);
    } catch (err) {
      next(err);
    }
  },

  async totals(req, res, next) {
    try {
      const totals = await RatingModel.totals(req.params.id);
      res.json(totals);
    } catch (err) {
      next(err);
    }
  },

  async unvote(req, res, next) {
    try {
      const ok = await RatingModel.remove(req.user.id, req.params.id);
      res.status(ok ? 204 : 404).end();
    } catch (err) {
      next(err);
    }
  },
};
