/**
 * @swagger
 * /me:
 *   get:
 *     summary: Get current user profile
 *     security: [ bearerAuth: [] ]
 *     tags: [Users]
 *     responses:
 *       200: { description: User object }
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
