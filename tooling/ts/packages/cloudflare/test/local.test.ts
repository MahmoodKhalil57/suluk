import { test, expect } from "bun:test";
import { Database } from "bun:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { drizzle } from "drizzle-orm/d1";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { eq } from "drizzle-orm";
import { d1FromSqlite, jsonFileKvStore, tableDDL, collectTables } from "../src/local";

const users = sqliteTable("users", { id: text("id").primaryKey(), email: text("email").notNull().unique(), credits: integer("credits").notNull().default(0) });

test("d1FromSqlite satisfies drizzle-orm/d1 end-to-end (insert…returning, where, update, project)", async () => {
  const sqlite = new Database(":memory:");
  for (const stmt of tableDDL(users)) sqlite.exec(stmt);
  const db = drizzle(d1FromSqlite(sqlite) as never);

  const ins = await db.insert(users).values({ id: "u1", email: "a@b.com", credits: 5 }).returning();
  expect(ins).toEqual([{ id: "u1", email: "a@b.com", credits: 5 }]);

  const sel = await db.select().from(users).where(eq(users.email, "a@b.com"));
  expect(sel[0]?.id).toBe("u1");

  await db.update(users).set({ credits: 10 }).where(eq(users.id, "u1"));
  const after = await db.select({ c: users.credits }).from(users).where(eq(users.id, "u1"));
  expect(after[0]?.c).toBe(10);
});

test("tableDDL emits a UNIQUE index for a .unique() column; collectTables de-dupes by name", () => {
  const ddl = tableDDL(users).join("\n");
  expect(ddl).toContain('CREATE TABLE IF NOT EXISTS "users"');
  expect(ddl).toContain("UNIQUE"); // email is .unique()
  const collected = collectTables([{ users, alias: users, notATable: 42 }]);
  expect(collected.length).toBe(1);
});

test("jsonFileKvStore: get/put round-trip, TTL expiry, delete, prefix list", async () => {
  const dir = mkdtempSync(join(tmpdir(), "suluk-kv-"));
  try {
    const kv = jsonFileKvStore(join(dir, "kv.json"));
    expect(await kv.get("missing")).toBeNull();

    await kv.put("rc:user:1", JSON.stringify({ balance: 3, ts: 1 }));
    expect(JSON.parse((await kv.get("rc:user:1"))!)).toEqual({ balance: 3, ts: 1 });

    // TTL in the past → reads back as null
    await kv.put("ephemeral", "x", { expirationTtl: -1 });
    expect(await kv.get("ephemeral")).toBeNull();

    await kv.put("rc:user:2", "y");
    const listed = await kv.list({ prefix: "rc:user:" });
    expect(listed.keys.map((k) => k.name).sort()).toEqual(["rc:user:1", "rc:user:2"]);

    await kv.delete("rc:user:1");
    expect(await kv.get("rc:user:1")).toBeNull();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("jsonFileMailbox: save appends, list returns in order, survives reopen", async () => {
  const dir = mkdtempSync(join(tmpdir(), "suluk-mbox-"));
  try {
    const { jsonFileMailbox } = await import("../src/local");
    const path = join(dir, "mbox.json");
    const mbox = jsonFileMailbox(path);
    expect(await mbox.list()).toEqual([]);
    await mbox.save({ to: "a@b.com", subject: "One", html: "<p>1</p>", at: "2026-01-01T00:00:00Z" });
    await jsonFileMailbox(path).save({ to: ["b@c.com"], subject: "Two", html: "<p>2</p>", at: "2026-01-02T00:00:00Z" });
    const all = await jsonFileMailbox(path).list();
    expect(all.map((e) => e.subject)).toEqual(["One", "Two"]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
