import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import mysql from "mysql2/promise";

test("MySQL preserves another owner's data and rolls back a failed edit", {
  skip: process.env.DOTDECK_MYSQL_TEST !== "1",
}, async () => {
  assert.equal(process.env.DB_HOST, "127.0.0.1", "integration tests require a local database");
  assert.match(process.env.DB_NAME ?? "", /_test$/, "integration tests require a dedicated _test database");
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST, port: Number(process.env.DB_PORT), user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD, database: process.env.DB_NAME, multipleStatements: true,
  });
  const { db } = await import("../config/db.js");
  try {
    await connection.query(await readFile(new URL("../schema.sql", import.meta.url), "utf8"));
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const [owner] = await connection.query("INSERT INTO dotdeck_user(username,email,password) VALUES (?,?,?)", [`owner-${suffix}`, `owner-${suffix}@example.test`, "unused-test-hash"]);
    const [other] = await connection.query("INSERT INTO dotdeck_user(username,email,password) VALUES (?,?,?)", [`other-${suffix}`, `other-${suffix}@example.test`, "unused-test-hash"]);
    const { DeckService } = await import("../services/deck.service.js");
    const id = await DeckService.create({ title: `Test ${suffix}`, description: "Original", snippets: [{ language: "sh", code: "echo original" }], tags: [] }, owner.insertId);

    await assert.rejects(DeckService.update(id, other.insertId, { snippets: [{ language: "sh", code: "echo changed" }], tags: ["unexpected"] }), { status: 403 });
    let [[snippet]] = await connection.query("SELECT code FROM dotdeck_code_snippet WHERE deck_id=?", [id]);
    assert.equal(snippet.code, "echo original");

    await assert.rejects(DeckService.update(id, owner.insertId, { description: "Must roll back", snippets: [{ language: "sh", code: "echo rollback" }], tags: ["x".repeat(81)] }));
    const [[deck]] = await connection.query("SELECT description FROM dotdeck_deck WHERE id=?", [id]);
    [[snippet]] = await connection.query("SELECT code FROM dotdeck_code_snippet WHERE deck_id=?", [id]);
    assert.equal(deck.description, "Original");
    assert.equal(snippet.code, "echo original");

    await DeckService.update(id, owner.insertId, { snippets: [{ language: "sh", code: "echo updated" }], tags: ["integration-test"] });
    [[snippet]] = await connection.query("SELECT code FROM dotdeck_code_snippet WHERE deck_id=?", [id]);
    assert.equal(snippet.code, "echo updated");
    await connection.query("DELETE FROM dotdeck_user WHERE id IN (?,?)", [owner.insertId, other.insertId]);
  } finally {
    await connection.end();
    await db.end();
  }
});
