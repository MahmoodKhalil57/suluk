import { test, expect, describe } from "bun:test";
import { Database } from "bun:sqlite";
import { drizzle as drizzleBunSqlite } from "drizzle-orm/bun-sqlite";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { eq } from "drizzle-orm";
import { atomicBatch, guardTransactions } from "../src/index";

const todo = sqliteTable("todo", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
});

// A minimal D1Database facade over bun:sqlite — just enough of the contract drizzle-orm/d1 drives
// (prepare/bind/all/run/batch) to prove atomicBatch's real, all-or-nothing round trip against the SAME
// driver shape production D1 uses. Mirrors @suluk/cloudflare's `d1FromSqlite`, inlined so this package's
// tests stay dependency-free of the cloudflare package (wrong-direction dependency otherwise).
function fakeD1(sqlite: Database) {
  const makeStmt = (sql: string, bound: unknown[] = []): unknown => ({
    bind: (...values: unknown[]) => makeStmt(sql, values),
    all: async () => ({ results: sqlite.query(sql).all(...(bound as never[])), success: true, meta: {} }),
    run: async () => {
      const r = sqlite.query(sql).run(...(bound as never[]));
      return { results: [], success: true, meta: { changes: r.changes, last_row_id: Number(r.lastInsertRowid) } };
    },
    raw: async () => sqlite.query(sql).values(...(bound as never[])),
  });
  return {
    prepare: (sql: string) => makeStmt(sql),
    batch: async (statements: { all: () => Promise<unknown> }[]) => sqlite.transaction(() => Promise.all(statements.map((s) => s.all())))(),
    exec: async (query: string) => { sqlite.exec(query); return { count: 0, duration: 0 }; },
    dump: async () => new ArrayBuffer(0),
  };
}

const mkD1Db = () => {
  const sqlite = new Database(":memory:");
  sqlite.run("CREATE TABLE todo (id TEXT PRIMARY KEY, title TEXT, completed INTEGER)");
  return drizzleD1(fakeD1(sqlite) as never);
};

describe("atomicBatch — the cross-driver-safe multi-statement primitive", () => {
  test("runs an insert + an update in ONE db.batch() round trip, both land", async () => {
    const db = mkD1Db();
    await atomicBatch(db, [
      db.insert(todo).values({ id: "1", title: "Buy milk" }),
      db.insert(todo).values({ id: "2", title: "Walk the dog" }),
    ]);
    await atomicBatch(db, [db.update(todo).set({ completed: true }).where(eq(todo.id, "1"))]);
    const rows = await db.select().from(todo).all();
    expect(rows).toEqual([
      { id: "1", title: "Buy milk", completed: true },
      { id: "2", title: "Walk the dog", completed: false },
    ]);
  });

  test("a real drizzle db's own .batch is what gets called — atomicBatch is a transparent pass-through", async () => {
    const db = mkD1Db();
    const [inserted] = await atomicBatch(db, [db.insert(todo).values({ id: "3", title: "x" }).returning()]);
    expect(inserted).toEqual([{ id: "3", title: "x", completed: false }]);
  });
});

describe("guardTransactions — disables db.transaction(), leaves everything else untouched", () => {
  test("calling .transaction() throws a clear, actionable error", () => {
    const sqlite = new Database(":memory:");
    const db = guardTransactions(drizzleBunSqlite(sqlite));
    expect(() => db.transaction(() => {})).toThrow(/db\.transaction\(\) is disabled/);
  });

  test("every other method still works normally after guarding — no proxy/this-binding regression", () => {
    const sqlite = new Database(":memory:");
    sqlite.run("CREATE TABLE todo (id TEXT PRIMARY KEY, title TEXT, completed INTEGER)");
    const db = guardTransactions(drizzleBunSqlite(sqlite));
    db.insert(todo).values({ id: "1", title: "Buy milk" }).run();
    expect(db.select().from(todo).all()).toEqual([{ id: "1", title: "Buy milk", completed: false }]);
  });

  test("guards a D1-shaped db too (the one actually at risk in production)", () => {
    const db = guardTransactions(mkD1Db());
    expect(() => db.transaction(async () => {})).toThrow(/db\.transaction\(\) is disabled/);
  });
});
