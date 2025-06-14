/**
 * @file /admin route-group – full administrative power.
 * @tags Admin: Site-wide administration
 */

import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import { adminRequired } from "../middleware/role.middleware.js";
import { BanService } from "../services/ban.service.js";
import { TagModel } from "../models/tag.model.js";
import { Audit } from "../utils/audit.util.js";
import { db } from "../config/db.js";

export const adminRouter = Router();

/* ban user */
adminRouter.post(
  "/users/:id/ban",
  authRequired,
  adminRequired,
  async (req, res, next) => {
    try {
      await BanService.ban(req.params.id, req.user.id, req.body.reason);
      res.status(204).end();
    } catch (e) {
      next(e);
    }
  },
);

/* unban user */
adminRouter.delete(
  "/users/:id/ban",
  authRequired,
  adminRequired,
  async (req, res, next) => {
    try {
      await BanService.unban(req.params.id, req.user.id);
      res.status(204).end();
    } catch (e) {
      next(e);
    }
  },
);

/* create tag */
adminRouter.post(
  "/tags",
  authRequired,
  adminRequired,
  async (req, res, next) => {
    try {
      const { name, tagType } = req.body;
      const [r] = await TagModel.create(name, tagType); // you can add create() to TagModel
      await Audit.log(req.user.id, "create_tag", "dotdeck_tag", r.insertId);
      res.status(201).json({ id: r.insertId });
    } catch (e) {
      next(e);
    }
  },
);

/* audit feed */
adminRouter.get(
  "/audit",
  authRequired,
  adminRequired,
  async (req, res, next) => {
    try {
      const [rows] = await db.query(
        "SELECT * FROM dotdeck_audit ORDER BY created_at DESC LIMIT 100",
      );
      res.json(rows);
    } catch (e) {
      next(e);
    }
  },
);
