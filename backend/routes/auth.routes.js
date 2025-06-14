/**
 * @file /auth route-group – sign-up & login.
 * @tags Auth: Sign-up & login
 */

import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../middleware/validate.middleware.js";
import { AuthController } from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post(
  "/signup",
  validate([
    body("username").isLength({ min: 3 }),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ]),
  AuthController.signup,
);

authRouter.post(
  "/login",
  validate([body("email").isEmail(), body("password").notEmpty()]),
  AuthController.login,
);
