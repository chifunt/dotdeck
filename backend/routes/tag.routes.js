/**
 * @file /tags route group.
 */

/**
 * @swagger
 * tags:
 *   name: Tags
 *   description: Public tag list
 */

/**
 * @swagger
 * /tags:
 *   get:
 *     summary: List all tags
 *     tags: [Tags]
 *     responses:
 *       200: { description: Tag array }
 */

import { Router } from "express";
import { TagController } from "../controllers/tag.controller.js";

export const tagRouter = Router();
tagRouter.get("/", TagController.list);
