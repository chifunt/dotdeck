/**
 * @file /tags route group.
 */

import { Router } from "express";
import { TagController } from "../controllers/tag.controller.js";

export const tagRouter = Router();
tagRouter.get("/", TagController.list);
