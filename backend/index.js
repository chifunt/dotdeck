import "dotenv/config";
import { db } from "./config/db.js";
import app from "./app.js";

// ---- fail-fast on critical env vars ----
const required = [
  "DB_HOST",
  "DB_PORT",
  "DB_USERNAME",
  "DB_PASSWORD", // empty string is fine but key must exist
  "DB_NAME",
  "ACCESS_TOKEN_SECRET",
];
for (const v of required) {
  if (!process.env[v]) {
    console.error(`❌  ${v} is not set – aborting start-up.`);
    process.exit(1);
  }
}

// ---- fail-fast on DB connectivity ----
try {
  await db.query("SELECT 1"); // simple ping
} catch (err) {
  console.error("❌  Cannot connect to MySQL – aborting start-up.");
  console.error(err.message || err);
  process.exit(1);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API ready on http://localhost:${PORT}`));
