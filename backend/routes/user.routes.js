/**
 * @file /me route-group – current user profile.
 * @tags Users: Current user profile retrieval
 */

import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import { UserModel } from "../models/user.model.js";

export const meRouter = Router();
meRouter.get("/", authRequired, async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
});
