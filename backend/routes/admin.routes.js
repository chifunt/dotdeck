/**
 * @file /admin route-group – full administrative power.
 *
 * @swagger
 * tags:
 *   name: Admin
 *   description: Site-wide administration
 *
 * /admin/users/{id}/ban:
 *   post:
 *     summary: Ban a user permanently
 *     tags: [Admin]
 *     security: [ bearerAuth: [] ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: { reason: { type: string } }
 *     responses:
 *       204: { description: Banned }
 *
 *   delete:
 *     summary: Un-ban a user
 *     tags: [Admin]
 *     security: [ bearerAuth: [] ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Unbanned }
 *
 * /admin/tags:
 *   post:
 *     summary: Create a new tag
 *     tags: [Admin]
 *     security: [ bearerAuth: [] ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, tagType]
 *             properties:
 *               name:    { type: string }
 *               tagType: { type: integer, description: FK → dotdeck_tag_type.id }
 *     responses:
 *       201: { description: New tag id }
 *
 * /admin/audit:
 *   get:
 *     summary: Recent audit rows (latest 100)
 *     tags: [Admin]
 *     security: [ bearerAuth: [] ]
 *     responses:
 *       200:
 *         description: Array of audit objects
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
