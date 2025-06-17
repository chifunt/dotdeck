/**
 * @file Express app bootstrap – global middleware & routes.
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import xssClean from "xss-clean";
import { json } from "express";

import { authRouter } from "./routes/auth.routes.js";
import { deckRouter } from "./routes/deck.routes.js";
import { tagRouter } from "./routes/tag.routes.js";
import { meRouter } from "./routes/user.routes.js";
import { userRouter } from "./routes/user-public.routes.js";
import { moderationRouter } from "./routes/moderation.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { bannedGuard } from "./middleware/banned.middleware.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import {
  rateLimitAuth,
  rateLimitGeneral,
} from "./middleware/rate-limit.middleware.js";

const app = express();

// ────────── global middleware ──────────
app.use(helmet());
app.use(cors());
app.use(json({ limit: "2mb" }));
app.use(xssClean());
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

// ────────── API v1 namespace ──────────
const api = express.Router();
api.use("/auth", rateLimitAuth, authRouter);

api.use(rateLimitGeneral);
api.use("/decks", bannedGuard, deckRouter);
api.use("/tags", tagRouter);
api.use("/me", meRouter);
api.use("/users", userRouter);
api.use("/moderation", bannedGuard, moderationRouter);
api.use("/admin", bannedGuard, adminRouter);

// Swagger lives inside the same namespace
api.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1", api); // ← single mount point

// ────────── 404  ──────────
app.use((_req, res) => res.status(404).json({ message: "Not found" }));

app.use(errorHandler);

export default app;
