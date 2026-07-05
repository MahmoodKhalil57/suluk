import { test, expect, describe } from "bun:test";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { eq } from "drizzle-orm";
import { tablePolicy, queryTable, queryKind } from "../src/index";

const plain = sqliteTable("plain", { id: text("id").primaryKey(), title: text("title").notNull() });

const payment = sqliteTable("payment", { id: text("id").primaryKey(), amount: text("amount").notNull() }).policy({
  dedupe: { ttlMs: 60_000, keySource: { header: "Idempotency-Key" } },
  requiresIdempotencyKey: true,
  retry: { times: 3, whenErrorTags: ["ExternalServiceError"] },
});

const mkDb = () => {
  const sqlite = new Database(":memory:");
  sqlite.run("CREATE TABLE plain (id TEXT PRIMARY KEY, title TEXT)");
  sqlite.run("CREATE TABLE payment (id TEXT PRIMARY KEY, amount TEXT)");
  return drizzle(sqlite);
};

describe("table.policy() (C111) — co-located execution policy, read back by tablePolicy", () => {
  test("a table with no .policy() declaration reads back {} (not undefined) — safe to spread unconditionally", () => {
    expect(tablePolicy(plain)).toEqual({});
  });

  test("a declared policy is read back verbatim", () => {
    expect(tablePolicy(payment)).toEqual({
      dedupe: { ttlMs: 60_000, keySource: { header: "Idempotency-Key" } },
      requiresIdempotencyKey: true,
      retry: { times: 3, whenErrorTags: ["ExternalServiceError"] },
    });
  });

  test(".policy() returns `this` — chainable alongside .zod()", () => {
    expect(payment.policy).toBeDefined();
    const chained = payment.policy({ idempotent: true });
    expect(chained).toBe(payment);
    expect(tablePolicy(payment).idempotent).toBe(true);
  });
});

describe("queryTable() — the table ANY query builder centrally touches, read off config.table", () => {
  test("SELECT ... FROM t", () => {
    const db = mkDb();
    expect(queryTable(db.select().from(plain))).toBe(plain);
    expect(queryTable(db.select({ id: plain.id }).from(plain).where(eq(plain.id, "x")))).toBe(plain);
  });

  test("INSERT INTO t", () => {
    const db = mkDb();
    expect(queryTable(db.insert(payment).values({ id: "a", amount: "10" }))).toBe(payment);
    expect(queryTable(db.insert(payment).values({ id: "a", amount: "10" }).returning())).toBe(payment);
  });

  test("UPDATE t", () => {
    const db = mkDb();
    expect(queryTable(db.update(payment).set({ amount: "20" }))).toBe(payment);
  });

  test("DELETE FROM t", () => {
    const db = mkDb();
    expect(queryTable(db.delete(payment))).toBe(payment);
  });

  test("a non-query value has no table", () => {
    expect(queryTable({})).toBeUndefined();
    expect(queryTable(undefined)).toBeUndefined();
  });
});

describe("queryKind() — discriminates select (read) from insert/update/delete (write)", () => {
  test("SELECT is a read, including a partial projection", () => {
    const db = mkDb();
    expect(queryKind(db.select().from(plain))).toBe("select");
    expect(queryKind(db.select({ id: plain.id }).from(plain).where(eq(plain.id, "x")))).toBe("select");
  });

  test("INSERT/UPDATE/DELETE are writes", () => {
    const db = mkDb();
    expect(queryKind(db.insert(payment).values({ id: "a", amount: "10" }))).toBe("insert");
    expect(queryKind(db.insert(payment).values({ id: "a", amount: "10" }).returning())).toBe("insert");
    expect(queryKind(db.update(payment).set({ amount: "20" }))).toBe("update");
    expect(queryKind(db.delete(payment))).toBe("delete");
  });

  test("a non-query value has no kind", () => {
    expect(queryKind({})).toBeUndefined();
    expect(queryKind(undefined)).toBeUndefined();
  });
});
