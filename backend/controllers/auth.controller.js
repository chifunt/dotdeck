/**
 * @file Express handler wrappers for auth routes.
 */

import { AuthService } from "../services/auth.service.js";

export const AuthController = {
  signup: async (req, res, next) => {
    try {
      const data = await AuthService.signup(req.body);
      res.status(201).json(data);
    } catch (err) {
      err.status = 400;
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const data = await AuthService.login(req.body);
      res.json(data);
    } catch (err) {
      err.status = 400;
      next(err);
    }
  },
};
