import dotenv from "dotenv";

// load .env first
dotenv.config();

// ---- fail-fast on critical env vars ----
const required = ["DB_HOST", "DB_USERNAME", "DB_NAME", "ACCESS_TOKEN_SECRET"];
for (const v of required) {
  if (!process.env[v]) {
    console.error(`❌  ${v} is not set – aborting start-up.`);
    process.exit(1);
  }
}

import app from "./app.js";

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API ready on http://localhost:${PORT}`));
