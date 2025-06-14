import dotenv from "dotenv";

// load .env first
dotenv.config();

// ---- fail-fast on critical env vars ----
if (!process.env.ACCESS_TOKEN_SECRET) {
  console.error("❌  ACCESS_TOKEN_SECRET is not set – aborting start-up.");
  process.exit(1);
}

import app from "./app.js";

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API ready on http://localhost:${PORT}`));
