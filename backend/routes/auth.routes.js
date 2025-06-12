/**
 * @file /auth route group.
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Sign-up & login
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Create a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username: { type: string, minLength: 3 }
 *               email:    { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       201: { description: JWT + user payload }
 *       400: { description: Email already in use }
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and get a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: JWT + user payload }
 *       400: { description: Invalid credentials }
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
