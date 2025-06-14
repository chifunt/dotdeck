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
import { moderationRouter } from "./routes/moderation.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { bannedGuard } from "./middleware/banned.middleware.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

const app = express();

// ────────── global middleware ──────────
app.use(helmet());
app.use(cors());
app.use(json({ limit: "2mb" }));
app.use(xssClean());
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

// ────────── routes ──────────
app.use("/auth", authRouter);
app.use("/decks", bannedGuard, deckRouter);
app.use("/tags", tagRouter);
app.use("/me", meRouter);
app.use("/moderation", bannedGuard, moderationRouter);
app.use("/admin", bannedGuard, adminRouter);

// Swagger
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (_req, res) => res.send("Dotdeck API 🎛️"));

// ────────── 404  ──────────
app.use((_req, res) => res.status(404).json({ message: "Not found" }));

app.use(errorHandler);

export default app;
