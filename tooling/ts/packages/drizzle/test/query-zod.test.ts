import { test, expect, describe } from "bun:test";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { withZod, queryZodSchema } from "../src/index";

const todo = sqliteTable("todo", {
  id: text("id").primaryKey().zod((s) => s.describe("The todo's unique id.")),
  userId: text("userId").notNull().zod((s) => s.describe("The owner's id.")),
  title: text("title").notNull().zod((s) => s.trim().min(1).max(500).describe("The todo's title.")),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false).zod((s) => s.describe("Whether it's done.")),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().zod((s) => s.describe("When it was created.")),
}).zod((s) => s.meta({ description: "A todo item." }));

const mkDb = () => {
  const sqlite = new Database(":memory:");
  sqlite.run("CREATE TABLE todo (id TEXT PRIMARY KEY, userId TEXT, title TEXT, completed INTEGER, createdAt INTEGER)");
  return drizzle(sqlite);
};

describe("withZod — schema DERIVED from the query's projected fields", () => {
  test("a projection → z.object of exactly those fields, carrying each column's .zod() (title's min/max/describe)", async () => {
    const db = mkDb();
    await db.insert(todo).values({ id: "a", userId: "u", title: "Buy milk", completed: false, createdAt: new Date() });
    const { schema, rows } = await withZod(db.select({ title: todo.title, completed: todo.completed }).from(todo).where(eq(todo.id, "a")).limit(1));
    const js = z.toJSONSchema(schema) as { properties: Record<string, { type?: string; minLength?: number; maxLength?: number; description?: string }> };
    expect(Object.keys(js.properties).sort()).toEqual(["completed", "title"]); // exactly the projected fields
    expect(js.properties.title).toMatchObject({ type: "string", minLength: 1, maxLength: 500, description: "The todo's title." });
    expect(js.properties.completed).toMatchObject({ type: "boolean", description: "Whether it's done." });
    expect(rows).toEqual([{ title: "Buy milk", completed: false }]); // schema.infer === a row
    expect(schema.parse(rows[0])).toEqual({ title: "Buy milk", completed: false });
  });

  test("schema mirrors rows exactly — a timestamp column stays z.date() (no wireDto)", async () => {
    const db = mkDb();
    const now = new Date("2026-07-04T00:00:00Z");
    await db.insert(todo).values({ id: "b", userId: "u", title: "T", completed: false, createdAt: now });
    const { schema, rows } = await withZod(db.select({ createdAt: todo.createdAt }).from(todo).where(eq(todo.id, "b")));
    expect((schema as unknown as z.ZodObject).shape.createdAt).toBeInstanceOf(z.ZodDate);
    expect(rows[0].createdAt).toBeInstanceOf(Date);
    expect(schema.parse(rows[0])).toEqual({ createdAt: now }); // schema accepts the actual row
  });

  test("a FULL-table projection returns the master zodSchema (all fields + entity describe)", async () => {
    const db = mkDb();
    const { schema } = await withZod(db.select().from(todo));
    expect(schema).toBe(todo.zodSchema); // the master itself, verbatim
    expect(Object.keys((schema as unknown as z.ZodObject).shape).sort()).toEqual(["completed", "createdAt", "id", "title", "userId"]);
  });

  test("insert .returning() (bare) → the master; a subset .returning({…}) → just those fields", async () => {
    const db = mkDb();
    const { schema: full, rows } = await withZod(db.insert(todo).values({ id: "c", userId: "u", title: "New", completed: false, createdAt: new Date() }).returning());
    expect(full).toBe(todo.zodSchema);
    expect(rows[0].id).toBe("c");
    const { schema: subset } = await withZod(db.insert(todo).values({ id: "d", userId: "u", title: "N2", completed: false, createdAt: new Date() }).returning({ id: todo.id, title: todo.title }));
    expect(Object.keys((subset as unknown as z.ZodObject).shape).sort()).toEqual(["id", "title"]);
  });

  test("a renamed projection keeps the source refinement; an SQL aggregate falls back to z.unknown()", async () => {
    const db = mkDb();
    const q = db.select({ t: todo.title, n: sql<number>`count(*)`.as("n") }).from(todo);
    const schema = queryZodSchema(q) as unknown as z.ZodObject;
    expect(z.toJSONSchema(schema.shape.t)).toMatchObject({ type: "string", maxLength: 500 }); // `t` still carries todo.title's zod
    expect(schema.shape.n.constructor.name).toBe("ZodUnknown"); // the aggregate has no column refinement
  });
});
