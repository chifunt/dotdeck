/**
 * @file /admin route-group – full administrative power.
 * @tags Admin: Site-wide administration
 */

import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import { adminRequired } from "../middleware/role.middleware.js";
import { db } from "../config/db.js";
import { TagModel } from "../models/tag.model.js";
import { TagService } from "../services/tag.service.js";
import { BanService } from "../services/ban.service.js";
import { Audit } from "../utils/audit.util.js";

export const adminRouter = Router();

// ─── BAN / UNBAN ─────────────────────────────────────────────────────────────

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

// ─── TAG MANAGEMENT ─────────────────────────────────────────────────────────

adminRouter.post(
  "/tags",
  authRequired,
  adminRequired,
  async (req, res, next) => {
    try {
      const { name, tagType } = req.body;
      const [r] = await TagModel.create(name, tagType);
      await Audit.log(req.user.id, "create_tag", "dotdeck_tag", r.insertId);
      res.status(201).json({ id: r.insertId });
    } catch (e) {
      next(e);
    }
  },
);

adminRouter.patch(
  "/tags/:id/approve",
  authRequired,
  adminRequired,
  async (req, res, next) => {
    try {
      await TagService.approve(req.params.id);
      res.status(204).end();
    } catch (e) {
      next(e);
    }
  },
);

adminRouter.patch(
  "/tags/:id/merge-into/:targetId",
  authRequired,
  adminRequired,
  async (req, res, next) => {
    try {
      await TagService.merge(req.params.id, req.params.targetId);
      res.status(204).end();
    } catch (e) {
      next(e);
    }
  },
);

// ─── STATS ───────────────────────────────────────────────────────────────────

adminRouter.get(
  "/stats",
  authRequired,
  adminRequired,
  async (req, res, next) => {
    try {
      const [[{ users }]] = await db.query(
        `SELECT COUNT(*) AS users FROM dotdeck_user`,
      );
      const [[{ decks }]] = await db.query(
        `SELECT COUNT(*) AS decks FROM dotdeck_deck`,
      );
      const [[{ tags }]] = await db.query(
        `SELECT COUNT(*) AS tags  FROM dotdeck_tag`,
      );
      const [[{ comments }]] = await db.query(
        `SELECT COUNT(*) AS comments FROM dotdeck_comment`,
      );
      const [[{ ratings }]] = await db.query(
        `SELECT COUNT(*) AS ratings FROM dotdeck_rating`,
      );

      res.json({ users, decks, tags, comments, ratings });
    } catch (e) {
      next(e);
    }
  },
);

// ─── LIST RESOURCES ──────────────────────────────────────────────────────────

function parsePaging(q = {}) {
  const limit = Math.min(Math.max(parseInt(q.limit) || 50, 1), 1000);
  const offset = Math.max(parseInt(q.offset) || 0, 0);
  return { limit, offset };
}

adminRouter.get(
  "/users",
  authRequired,
  adminRequired,
  async (req, res, next) => {
    try {
      const { limit, offset } = parsePaging(req.query);
      const [data] = await db.query(
        `SELECT id, username, email, role, banned_at AS bannedAt, created_at AS createdAt
           FROM dotdeck_user
          ORDER BY created_at DESC
          LIMIT ? OFFSET ?`,
        [limit, offset],
      );
      const [[{ total }]] = await db.query(
        `SELECT COUNT(*) AS total FROM dotdeck_user`,
      );
      res.json({ data, paging: { limit, offset, total } });
    } catch (e) {
      next(e);
    }
  },
);

adminRouter.get(
  "/decks",
  authRequired,
  adminRequired,
  async (req, res, next) => {
    try {
      const { limit, offset } = parsePaging(req.query);
      const [data] = await db.query(
        `SELECT id, title, slug, user_id AS userId, created_at AS createdAt, deleted_at AS deletedAt
           FROM dotdeck_deck
          ORDER BY created_at DESC
          LIMIT ? OFFSET ?`,
        [limit, offset],
      );
      const [[{ total }]] = await db.query(
        `SELECT COUNT(*) AS total FROM dotdeck_deck`,
      );
      res.json({ data, paging: { limit, offset, total } });
    } catch (e) {
      next(e);
    }
  },
);

adminRouter.get(
  "/tags",
  authRequired,
  adminRequired,
  async (req, res, next) => {
    try {
      const { limit, offset } = parsePaging(req.query);
      const [data] = await db.query(
        `SELECT t.id, t.name, t.tag_type AS tagType, t.is_official AS isOfficial, tt.name AS tagTypeName
           FROM dotdeck_tag t
      LEFT JOIN dotdeck_tag_type tt ON tt.id = t.tag_type
          ORDER BY tt.id, t.name
          LIMIT ? OFFSET ?`,
        [limit, offset],
      );
      const [[{ total }]] = await db.query(
        `SELECT COUNT(*) AS total FROM dotdeck_tag`,
      );
      res.json({ data, paging: { limit, offset, total } });
    } catch (e) {
      next(e);
    }
  },
);

adminRouter.get(
  "/audit-logs",
  authRequired,
  adminRequired,
  async (req, res, next) => {
    try {
      const { limit, offset } = parsePaging(req.query);
      const [data] = await db.query(
        `SELECT * FROM dotdeck_audit
          ORDER BY created_at DESC
          LIMIT ? OFFSET ?`,
        [limit, offset],
      );
      const [[{ total }]] = await db.query(
        `SELECT COUNT(*) AS total FROM dotdeck_audit`,
      );
      res.json({ data, paging: { limit, offset, total } });
    } catch (e) {
      next(e);
    }
  },
);

// ─── DEPRECATION ALIAS ───────────────────────────────────────────────────────

// keep the old `/audit` around in case something’s hard-coded
adminRouter.get("/audit", authRequired, adminRequired, (req, res) =>
  res.redirect(307, `${req.baseUrl}/audit-logs${req.url.slice(6)}`),
);

export default adminRouter;
