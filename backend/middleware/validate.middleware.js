/**
 * @file Wraps express-validator; sends 422 on error.
 */

import { validationResult } from "express-validator";

export const validate = (schemas) => [
  ...schemas,
  (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    return res.status(422).json({ errors: errors.array() });
  },
];
