/**
 * @suluk/drizzle inline-zod tests — prove the co-located `.zod()` seam: a refinement stashed ON a column
 * survives `sqliteTable`, `tableZod` reads the whole table back as ONE annotated zod object, the inline
 * constraints + metadata actually validate + surface, a refiner can reuse ANOTHER table's field (FK trick),
 * and arbitrary operations (CRUD and non-CRUD) slice cleanly off the one source. CANDIDATE tooling.
 */
import { test, expect, describe } from "bun:test";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { getTableColumns } from "drizzle-orm";
import { z } from "zod";
import { tableZod, tableZodSchemas } from "../src/index";

// A user table whose `userId` field zod we reuse below (FK-consistency trick). Reuse is off the EXTRACTED
// zod object (`User.shape.userId`) — a drizzle *table* has no `.shape`; only the projected zod object does.
const user = sqliteTable("user", {
  userId: text("userId").primaryKey().zod((s) => s.describe("A user id.").meta({ examples: ["u_123"] })),
});
const User = tableZod(user) as z.ZodObject;

const todo = sqliteTable("todo", {
  id: text("id").primaryKey().zod((s) => s.describe("The todo id.").meta({ examples: ["a3a2"] })),
  userId: text("userId").notNull().zod(() => User.shape.userId as z.ZodType), // reuse the user field verbatim
  title: text("title").notNull().zod((s) => s.min(1).max(500).meta({ description: "The todo text." })),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false)
    .zod((s) => s.meta({ description: "Whether the todo is done." })),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  plain: text("plain"), // NO .zod() — must still appear, using drizzle-zod's default mapping
});

describe("the `.zod()` seam", () => {
  test("returns the same builder (chain + sqliteTable unaffected) and stashes on config", () => {
    const builder = text("x").notNull();
    const same = builder.zod((s) => s.min(1));
    expect(same).toBe(builder); // returns `this`
    // the stash survives the build and is readable off the built column
    const stashed = (getTableColumns(todo).title as unknown as { config?: Record<symbol, unknown> }).config?.[
      Symbol.for("suluk.drizzle.inlineZod")
    ];
    expect(typeof stashed).toBe("function");
  });
});

describe("tableZod", () => {
  const Todo = tableZod(todo, { describe: "The todo." });

  test("reconstructs EVERY column (annotated and un-annotated alike)", () => {
    expect(Object.keys((Todo as z.ZodObject).shape).sort()).toEqual(
      ["completed", "createdAt", "id", "plain", "title", "userId"].sort(),
    );
    expect((Todo as z.ZodType).description).toBe("The todo.");
  });

  test("co-located metadata + description flow through", () => {
    const shape = (Todo as z.ZodObject).shape as Record<string, z.ZodType>;
    expect(shape.title.description).toBe("The todo text.");
    expect((shape.id.meta?.() as { examples?: unknown[] })?.examples).toEqual(["a3a2"]);
  });

  test("co-located CONSTRAINTS actually validate", () => {
    const base = { id: "a", userId: "u_1", title: "Buy milk", completed: false, createdAt: new Date(), plain: null };
    expect(Todo.safeParse(base).success).toBe(true);
    expect(Todo.safeParse({ ...base, title: "" }).success).toBe(false); // min(1) rejects empty
  });

  test("a refiner can REUSE another table's field (FK trick)", () => {
    const shape = (Todo as z.ZodObject).shape as Record<string, z.ZodType>;
    // userId inherited the user table's description verbatim
    expect(shape.userId.description).toBe("A user id.");
  });

  test("drizzle-zod's base mapping is preserved — un-refined `plain` is nullable (notNull:false)", () => {
    const shape = (Todo as z.ZodObject).shape as Record<string, z.ZodType>;
    expect(shape.plain.safeParse(null).success).toBe(true);
  });
});

describe("operations sliced off the ONE source", () => {
  const Todo = tableZod(todo) as z.ZodObject;

  test("CRUD create/update", () => {
    const CreateReq = Todo.pick({ title: true });
    const Patch = Todo.omit({ id: true, userId: true, createdAt: true }).partial();
    expect(Object.keys(CreateReq.shape)).toEqual(["title"]);
    expect(Object.keys(Patch.shape).sort()).toEqual(["completed", "plain", "title"].sort());
    // the create DTO keeps the inline min(1) constraint
    expect(CreateReq.safeParse({ title: "" }).success).toBe(false);
  });

  test("a NON-CRUD operation (toggle) slices just as cleanly", () => {
    const Toggle = Todo.pick({ id: true, completed: true });
    expect(Object.keys(Toggle.shape).sort()).toEqual(["completed", "id"].sort());
    expect(Toggle.safeParse({ id: "a", completed: true }).success).toBe(true);
  });
});

describe("tableZodSchemas — co-located select/insert/update", () => {
  test("all three projections carry the inline refinements", () => {
    const { select, insert, update } = tableZodSchemas(todo, { describe: "The todo." });
    expect((select as z.ZodType).description).toBe("The todo.");
    // insert relaxes the defaulted `completed` (drizzle-zod), update makes every field optional
    expect((insert as z.ZodObject).safeParse({ id: "a", userId: "u", title: "t", createdAt: new Date() }).success).toBe(true);
    expect((update as z.ZodObject).safeParse({}).success).toBe(true);
    // the inline title constraint rides into insert
    expect((insert as z.ZodObject).safeParse({ id: "a", userId: "u", title: "", createdAt: new Date() }).success).toBe(false);
  });
});
