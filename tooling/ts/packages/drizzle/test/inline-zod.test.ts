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
import { tableZod, tableZodSchemas, wireDto } from "../src/index";

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

describe("table-level `.zod()` + wireDto — parity with the base app seam", () => {
  const thing = sqliteTable("thing", {
    id: text("id").primaryKey().zod((s) => s.meta({ description: "the id" })),
    title: text("title").notNull().zod((s) => s.trim().min(1).max(25).meta({ description: "the title", examples: ["hi"] })),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull().zod((s) => s.meta({ description: "created ms", examples: [1] })),
  }).zod((s) => s.meta({ description: "A thing." }));

  test("the chained table-level `.zod()` sets the ENTITY meta on the select object", () => {
    // (checked via `.description`/`.shape`, not z.toJSONSchema — the select carries a Date column, unrepresentable in JSON Schema)
    const select = tableZodSchemas(thing).select as z.ZodObject;
    expect((select as z.ZodType).description).toBe("A thing.");
    const shape = select.shape as Record<string, z.ZodType>;
    expect(shape.title.description).toBe("the title");
    expect(shape.title.safeParse("x".repeat(26)).success).toBe(false); // max(25) enforced
    expect(shape.title.safeParse("  hi  ").success).toBe(true);
  });

  test("column constraints ride into insert + update (the package refines all three)", () => {
    const { insert, update } = tableZodSchemas(thing);
    expect(((insert as z.ZodObject).shape.title as z.ZodType).safeParse("x".repeat(26)).success).toBe(false);
    expect(((update as z.ZodObject).shape.title as z.ZodType).safeParse("x".repeat(26)).success).toBe(false);
  });

  test("wireDto projects Date timestamps → epoch-ms integer, carrying the field meta + the entity", () => {
    const dto = wireDto(tableZodSchemas(thing).select);
    const js = z.toJSONSchema(dto) as { description?: string; properties: Record<string, { type?: string; description?: string }> };
    expect(js.description).toBe("A thing.");
    expect(js.properties.createdAt.type).toBe("integer");
    expect(js.properties.createdAt.description).toBe("created ms");
    // z.infer<typeof dto>.createdAt is a NUMBER (Date → epoch-ms), and it parses:
    const parsed: { createdAt: number; title: string } = dto.parse({ id: "x", title: "hi", createdAt: 123 }) as { createdAt: number; title: string };
    expect(parsed.createdAt).toBe(123);
  });

  test("`table.zodSchema` is the MASTER — statically read off the table, precisely typed, sliceable + memoized", () => {
    // STATIC + TYPED (no casts — these lines only compile because `thing.zodSchema` is the EXACT typed row schema):
    const row: z.infer<typeof thing.zodSchema> = { id: "x", title: "hi", createdAt: new Date() };
    expect(row.id).toBe("x");
    const master = thing.zodSchema; // precisely typed; `.shape`/`.pick` resolve to the real fields
    expect(Object.keys(master.shape).sort()).toEqual(["createdAt", "id", "title"]);
    // slice operations off the master — the column's max(25) rides through (typed, no cast):
    const Create = master.pick({ title: true });
    expect(Object.keys(Create.shape)).toEqual(["title"]);
    expect(Create.shape.title.safeParse("x".repeat(26)).success).toBe(false);
    // memoized — referentially stable:
    expect(thing.zodSchema).toBe(thing.zodSchema);
  });
});
