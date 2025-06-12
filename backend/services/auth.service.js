/**
 * @file Business logic for signup / login.
 */

import jwt from "jsonwebtoken";
import { hashPassword, verifyPassword } from "../utils/password.util.js";
import { UserModel } from "../models/user.model.js";

const { ACCESS_TOKEN_SECRET } = process.env;

export const AuthService = {
  async signup({ username, email, password }) {
    const existing = await UserModel.findByEmail(email);
    if (existing) throw new Error("Email already in use");

    const passwordHash = await hashPassword(password);
    const newUser = await UserModel.create({ username, email, passwordHash });

    return this._issueToken(newUser);
  },

  async login({ email, password }) {
    const user = await UserModel.findByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const ok = await verifyPassword(password, user.password);
    if (!ok) throw new Error("Invalid credentials");

    return this._issueToken(user);
  },

  _issueToken(user) {
    const payload = { id: user.id, username: user.username };
    const token = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "7d" });
    return { token, user: payload };
  },
};
