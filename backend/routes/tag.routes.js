/**
 * @file /tags route-group – public tag listing.
 * @tags Tags: Public tag list
 */

import { Router } from "express";
import { TagController } from "../controllers/tag.controller.js";

export const tagRouter = Router();
tagRouter.get("/", TagController.list);
