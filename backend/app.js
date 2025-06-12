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
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

// ────────── global middleware ──────────
app.use(helmet());
app.use(cors());
app.use(json({ limit: "2mb" }));
app.use(xssClean());
app.use(morgan("dev"));

// ────────── routes ──────────
app.use("/auth", authRouter);
app.use("/decks", deckRouter);
app.use("/tags", tagRouter);

app.get("/", (_req, res) => res.send("Dotdeck API 🎛️"));

app.use(errorHandler);

export default app;
