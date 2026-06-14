/**
 * Once-only WRITE primitives. rowsChanged normalizes every driver's result shape; claimOnce makes a conditional
 * transition fire exactly once — the second claim of the same transition wins nothing (the money-path guarantee).
 */
import { test, expect, describe, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { drizzle, type BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { and, eq } from "drizzle-orm";
import { rowsChanged, claimOnce, claimRows, schemaDDL, type ClaimDb } from "../src/index";

describe("rowsChanged", () => {
  test("normalizes bun:sqlite .changes, D1 .meta.changes, others .rowsAffected; 0 when unknown", () => {
    expect(rowsChanged({ changes: 1 })).toBe(1);            // bun:sqlite / better-sqlite3
    expect(rowsChanged({ meta: { changes: 2 } })).toBe(2);  // D1
    expect(rowsChanged({ rowsAffected: 3 })).toBe(3);       // some drivers
    expect(rowsChanged({})).toBe(0);
    expect(rowsChanged(null)).toBe(0);
    expect(rowsChanged(undefined)).toBe(0);
  });
});

const order = sqliteTable("order", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  status: text("status").notNull().default("pending"),
});

describe("claimOnce — atomic compare-and-set", () => {
  let db: BunSQLiteDatabase;
  beforeEach(() => { const s = new Database(":memory:"); s.exec(schemaDDL([order])); db = drizzle(s); db.insert(order).values({ status: "pending" }).run(); });

  test("first claim of pending→paid wins; the second (re-delivery) changes nothing", async () => {
    const won1 = await claimOnce(db as unknown as ClaimDb, order, and(eq(order.id, 1), eq(order.status, "pending"))!, { status: "paid" });
    const won2 = await claimOnce(db as unknown as ClaimDb, order, and(eq(order.id, 1), eq(order.status, "pending"))!, { status: "paid" });
    expect(won1).toBe(true);
    expect(won2).toBe(false); // already paid — the FROM-state guard fails, no row changed
    expect(db.select().from(order).where(eq(order.id, 1)).get()!.status).toBe("paid");
  });

  test("a transition whose FROM-state doesn't match claims nothing", async () => {
    // row is pending; try to claim paid→cancelled → no match
    expect(await claimOnce(db as unknown as ClaimDb, order, and(eq(order.id, 1), eq(order.status, "paid"))!, { status: "cancelled" })).toBe(false);
    expect(db.select().from(order).where(eq(order.id, 1)).get()!.status).toBe("pending"); // untouched
  });
});

describe("claimRows — claim a set + return exactly the rows this call won", () => {
  let db: BunSQLiteDatabase;
  beforeEach(() => { const s = new Database(":memory:"); s.exec(schemaDDL([order])); db = drizzle(s); for (let i = 0; i < 3; i++) db.insert(order).values({ status: "pending" }).run(); });

  test("claims matching rows once; a re-run claims a disjoint (empty) set", async () => {
    const first = await claimRows<{ id: number }>(db as unknown as ClaimDb, order, eq(order.status, "pending"), { status: "paid" });
    expect(first.map((r) => r.id).sort()).toEqual([1, 2, 3]); // returned the rows it flipped
    const second = await claimRows(db as unknown as ClaimDb, order, eq(order.status, "pending"), { status: "paid" });
    expect(second.length).toBe(0); // already paid → nothing left to claim (no double-handling)
  });
});
