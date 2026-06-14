/**
 * tableDDL / schemaDDL — generate SQLite CREATE TABLE from a Drizzle table. Asserts the type/default/PK mapping,
 * reserved-word quoting, AND the SQL-column-name (snake_case) vs JS-key (camelCase) distinction, then round-trips:
 * the generated DDL runs in a real bun:sqlite DB and accepts inserts that honor the defaults — proof the schema is
 * valid + faithful, not just string-shaped.
 */
import { test, expect, describe } from "bun:test";
import { Database } from "bun:sqlite";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { tableDDL, schemaDDL } from "../src/index";

// "order" is a SQLite reserved word; customer_id (camel JS key) exercises the SQL-name path; boolean+enum+defaults the mapping.
const order = sqliteTable("order", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: text("customer_id"),                                  // camelCase key → snake_case SQL name
  total: integer("total").notNull().default(0),
  status: text("status", { enum: ["pending", "paid"] }).notNull().default("pending"),
  paid: integer("paid", { mode: "boolean" }).notNull().default(false),
  note: text("note"),
});

describe("tableDDL", () => {
  const ddl = tableDDL(order);
  test("quotes reserved table names + maps types + uses the SQL column name", () => {
    expect(ddl).toContain('CREATE TABLE IF NOT EXISTS "order"');
    expect(ddl).toContain('"customer_id" TEXT');   // SQL name, not the JS key "customerId"
    expect(ddl).not.toContain("customerId");
    expect(ddl).toContain('"total" INTEGER NOT NULL DEFAULT 0');
    expect(ddl).toContain('"note" TEXT');           // nullable, no default
    expect(ddl).not.toContain('"note" TEXT NOT NULL');
  });
  test("autoincrement PK, boolean→INTEGER 0/1, string defaults quoted", () => {
    expect(ddl).toContain('"id" INTEGER PRIMARY KEY AUTOINCREMENT');
    expect(ddl).toContain('"paid" INTEGER NOT NULL DEFAULT 0');     // boolean false → 0, type INTEGER
    expect(ddl).toContain(`"status" TEXT NOT NULL DEFAULT 'pending'`);
  });
  test("ifNotExists:false drops the guard", () => {
    expect(tableDDL(order, { ifNotExists: false })).toContain('CREATE TABLE "order"');
  });
});

describe("round-trip in a real bun:sqlite DB", () => {
  test("the generated DDL is valid SQL + applies the defaults under the SQL column names", () => {
    const db = new Database(":memory:");
    db.exec(schemaDDL([order]));
    db.exec(`INSERT INTO "order" (customer_id, note) VALUES ('u1', 'hi')`); // rely on total/status/paid defaults
    const row = db.query(`SELECT id, customer_id, total, status, paid, note FROM "order"`).get() as Record<string, unknown>;
    expect(row.id).toBe(1);              // autoincrement
    expect(row.customer_id).toBe("u1");  // snake_case column exists
    expect(row.total).toBe(0);           // default 0
    expect(row.status).toBe("pending");  // default 'pending'
    expect(row.paid).toBe(0);            // boolean default false → 0
    expect(row.note).toBe("hi");
    db.close();
  });
});
