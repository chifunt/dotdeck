import assert from "node:assert/strict";
import test from "node:test";
import { createDeckService } from "../services/deck.service.js";
import { DeckModel } from "../models/deck.model.js";

function fixture({ ownerId = 7, deleted = false, exists = true, failWrite = false } = {}) {
  const calls = [];
  const conn = {
    beginTransaction: async () => calls.push("begin"),
    commit: async () => calls.push("commit"),
    rollback: async () => calls.push("rollback"),
    release: () => calls.push("release"),
    query: async (sql, values) => {
      calls.push({ sql, values });
      if (sql.includes("FOR UPDATE")) {
        assert.match(sql, /id = \? AND user_id = \? AND deleted_at IS NULL/);
        return [exists && !deleted && values[0] === 42 && values[1] === ownerId ? [{ id: 42 }] : []];
      }
      if (sql.startsWith("SELECT 1")) return [[]];
      if (failWrite) throw new Error("Storage unavailable");
      return [{ affectedRows: 1 }];
    },
  };
  const service = createDeckService({
    database: { getConnection: async () => conn },
    tags: { ensureTags: async (names, connection) => {
      assert.equal(connection, conn, "tag creation must use the same transaction");
      calls.push("tags");
      return names.map((_, i) => i + 1);
    } },
  });
  return { service, calls };
}

for (const [name, payload] of [
  ["title and snippets", { title: "Changed title", snippets: [{ code: "echo safe" }] }],
  ["snippets only", { snippets: [{ code: "echo safe" }] }],
  ["tags only", { tags: ["shell"] }],
]) {
  test(`a non-owner cannot replace ${name}`, async () => {
    const { service, calls } = fixture();
    await assert.rejects(service.update(42, 8, payload), { status: 403 });
    assert.equal(calls.filter((call) => typeof call === "object").length, 1);
    assert.equal(calls.includes("tags"), false);
    assert.equal(calls.includes("commit"), false);
    assert.deepEqual(calls.slice(-2), ["rollback", "release"]);
  });
}

for (const options of [{ exists: false }, { deleted: true }]) {
  test(`an unavailable deck rejects all writes: ${JSON.stringify(options)}`, async () => {
    const { service, calls } = fixture(options);
    await assert.rejects(service.update(42, 7, { snippets: [{ code: "echo safe" }] }), { status: 403 });
    assert.equal(calls.filter((call) => typeof call === "object").length, 1);
    assert.deepEqual(calls.slice(-2), ["rollback", "release"]);
  });
}

test("an owner can replace snippets and tags without changing scalar fields", async () => {
  const { service, calls } = fixture();
  await service.update(42, 7, { snippets: [{ language: "sh", code: "echo safe" }], tags: ["shell"] });
  assert.match(calls[1].sql, /FOR UPDATE/);
  assert.ok(calls.some((call) => call.sql?.startsWith("INSERT INTO dotdeck_code_snippet")));
  assert.ok(calls.includes("tags"));
  assert.deepEqual(calls.slice(-2), ["commit", "release"]);
});

test("a child-write failure rolls back and releases the transaction", async () => {
  const { service, calls } = fixture({ failWrite: true });
  await assert.rejects(service.update(42, 7, { snippets: [{ code: "echo safe" }] }), /Storage unavailable/);
  assert.equal(calls.includes("commit"), false);
  assert.deepEqual(calls.slice(-2), ["rollback", "release"]);
});

test("scalar updates report zero matched rows and allow clearing a description", async () => {
  const conn = { query: async (sql, values) => {
    assert.match(sql, /description = \?/);
    assert.equal(values[0], "");
    return [{ affectedRows: 0 }];
  } };
  assert.equal(await DeckModel.update(42, 8, { description: "" }, conn), false);
});
