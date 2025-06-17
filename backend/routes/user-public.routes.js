/**
 * @file /users route-group – public profiles.
 * @tags Users
 */

import { Router } from "express";
import { query } from "express-validator";
import { validate } from "../middleware/validate.middleware.js";
import { UserController } from "../controllers/user.controller.js";

export const userRouter = Router();

userRouter.get(
  "/:username",
  validate([
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
    query("offset").optional().isInt({ min: 0 }).toInt(),
  ]),
  UserController.profile,
);
