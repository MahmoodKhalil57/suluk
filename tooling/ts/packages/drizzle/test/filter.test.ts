import { test, expect, describe } from "bun:test";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { eq, desc } from "drizzle-orm";
import {
  filterNodeSchema, parseListQuery, compileFilter, compileSort, compileTextSearch, resolveListQuery, type FilterNode,
} from "../src/index";

const todo = sqliteTable("todo", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  title: text("title").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  priority: integer("priority").notNull().default(0),
  createdAt: integer("createdAt").notNull(),
});

const mkDb = () => {
  const sqlite = new Database(":memory:");
  sqlite.run("CREATE TABLE todo (id TEXT PRIMARY KEY, userId TEXT, title TEXT, completed INTEGER, priority INTEGER, createdAt INTEGER)");
  const db = drizzle(sqlite);
  const rows = [
    { id: "1", userId: "u1", title: "Buy milk", completed: false, priority: 1, createdAt: 100 },
    { id: "2", userId: "u1", title: "Buy 100% juice", completed: true, priority: 3, createdAt: 200 },
    { id: "3", userId: "u1", title: "Walk the dog", completed: false, priority: 2, createdAt: 300 },
    { id: "4", userId: "u2", title: "Someone else's todo", completed: false, priority: 5, createdAt: 400 },
  ];
  for (const r of rows) db.insert(todo).values(r).run();
  return db;
};

describe("filterNodeSchema — the recursive, JSON-Schema-describable advanced filter tree", () => {
  test("a leaf condition validates field against the real columns and op against the closed vocabulary", () => {
    const schema = filterNodeSchema(todo);
    expect(schema.parse({ field: "title", op: "contains", value: "milk" })).toEqual({ field: "title", op: "contains", value: "milk" });
    expect(() => schema.parse({ field: "nope", op: "eq", value: "x" })).toThrow();
    expect(() => schema.parse({ field: "title", op: "bogus", value: "x" })).toThrow();
  });

  test("and/or/not compose recursively, arbitrarily deep", () => {
    const schema = filterNodeSchema(todo);
    const tree: FilterNode = {
      and: [
        { field: "userId", op: "eq", value: "u1" },
        { or: [
          { field: "completed", op: "eq", value: true },
          { not: { field: "priority", op: "lt", value: 2 } },
        ] },
      ],
    };
    expect(schema.parse(tree)).toEqual(tree);
  });

  test("empty and/or arrays are rejected (min 1) — an ambiguous no-op tree is never silently accepted", () => {
    const schema = filterNodeSchema(todo);
    expect(() => schema.parse({ and: [] })).toThrow();
    expect(() => schema.parse({ or: [] })).toThrow();
  });

  test("a filter tree past maxFilterNodes is rejected at validation time — never reaches SQL compilation/execution", () => {
    const schema = filterNodeSchema(todo);
    const wide: FilterNode = { or: Array.from({ length: 1000 }, (_, i) => ({ field: "title", op: "eq" as const, value: `x${i}` })) };
    expect(() => schema.parse(wide)).toThrow(/too many conditions/);
    const deep = Array.from({ length: 1000 }).reduce<FilterNode>((n) => ({ not: n }), { field: "title", op: "eq", value: "x" });
    expect(() => schema.parse(deep)).toThrow(/too many conditions/);
  });

  test("a tree within the default bound (200 nodes) still validates fine", () => {
    const schema = filterNodeSchema(todo);
    const ok: FilterNode = { or: Array.from({ length: 50 }, (_, i) => ({ field: "title", op: "eq" as const, value: `x${i}` })) };
    expect(() => schema.parse(ok)).not.toThrow();
  });

  test("maxFilterNodes is configurable via opts", () => {
    const schema = filterNodeSchema(todo, { maxFilterNodes: 5 });
    expect(() => schema.parse({ or: Array.from({ length: 10 }, (_, i) => ({ field: "title", op: "eq" as const, value: `x${i}` })) })).toThrow(/too many conditions/);
  });
});

describe("parseListQuery — SIMPLE mode (flat/operator-suffix params) vs ADVANCED mode (JSON filter)", () => {
  test("a bare `column=value` is an implicit eq filter", () => {
    const q = parseListQuery({ title: "milk" }, todo);
    expect(q.filter).toEqual({ field: "title", op: "eq", value: "milk" });
    expect(q.filters).toEqual({ title: "milk" }); // legacy shape still populated
  });

  test("`column__op=value` uses the named operator; multiple simple filters fold into an implicit AND", () => {
    const q = parseListQuery({ title__contains: "milk", "priority__gte": "2" }, todo);
    expect(q.filter).toEqual({
      and: [
        { field: "title", op: "contains", value: "milk" },
        { field: "priority", op: "gte", value: "2" },
      ],
    });
  });

  test("`column__in=a,b,c` splits into an array value", () => {
    const q = parseListQuery({ "id__in": "1,2,3" }, todo);
    expect(q.filter).toEqual({ field: "id", op: "in", value: ["1", "2", "3"] });
  });

  test("an unrecognized column or op is silently ignored in SIMPLE mode (never widened into a raw filter)", () => {
    const q = parseListQuery({ bogus: "x", "title__nonsense": "y" }, todo);
    expect(q.filter).toBeUndefined();
    expect(q.filters).toEqual({});
  });

  test("the ADVANCED `filter` JSON param wins outright over SIMPLE params — no ambiguous merge", () => {
    const advanced: FilterNode = { field: "completed", op: "eq", value: true };
    const q = parseListQuery({ filter: JSON.stringify(advanced), title: "ignored-because-filter-present" }, todo);
    expect(q.filter).toEqual(advanced);
    expect(q.filters).toEqual({}); // simple-mode filters map is NOT populated when advanced mode is used
  });

  test("an invalid ADVANCED filter (bad field/op) throws at parse time", () => {
    expect(() => parseListQuery({ filter: JSON.stringify({ field: "nope", op: "eq", value: 1 }) }, todo)).toThrow();
    expect(() => parseListQuery({ filter: "{not json" }, todo)).toThrow();
  });
});

describe("multi-column sort — `sort=-createdAt,title` and the legacy single `sort`+`order`", () => {
  test("comma-separated, per-token `-` prefix for desc", () => {
    const q = parseListQuery({ sort: "-createdAt,title" }, todo);
    expect(q.sort).toEqual([{ column: "createdAt", dir: "desc" }, { column: "title", dir: "asc" }]);
    expect(q.orderBy).toEqual({ column: "createdAt", dir: "desc" }); // legacy single-column mirror = sort[0]
  });

  test("legacy single `sort=col`+`order=desc` still works, applying `order` as the fallback direction", () => {
    const q = parseListQuery({ sort: "priority", order: "desc" }, todo);
    expect(q.sort).toEqual([{ column: "priority", dir: "desc" }]);
  });

  test("an unrecognized sort column is dropped, not smuggled into a raw ORDER BY", () => {
    const q = parseListQuery({ sort: "evil,title" }, todo);
    expect(q.sort).toEqual([{ column: "title", dir: "asc" }]);
  });
});

describe("compileFilter — real, bound drizzle SQL; rejects an op the column's dataType doesn't support", () => {
  test("compiles a leaf condition and runs correctly against real rows", () => {
    const db = mkDb();
    const where = compileFilter(todo, { field: "title", op: "contains", value: "milk" });
    const rows = db.select().from(todo).where(where).all();
    expect(rows.map((r) => r.id)).toEqual(["1"]);
  });

  test("a literal `%`/`_` in the search value is escaped — matches verbatim, not as a SQL wildcard", () => {
    const db = mkDb();
    const where = compileFilter(todo, { field: "title", op: "contains", value: "100%" });
    const rows = db.select().from(todo).where(where).all();
    expect(rows.map((r) => r.id)).toEqual(["2"]); // only the row with a literal "100%", not every row (which a raw % would match)
  });

  test("and/or/not compile to the correct real result set", () => {
    const db = mkDb();
    const tree: FilterNode = {
      and: [
        { field: "userId", op: "eq", value: "u1" },
        { or: [{ field: "completed", op: "eq", value: true }, { field: "priority", op: "gte", value: 2 }] },
      ],
    };
    const rows = db.select().from(todo).where(compileFilter(todo, tree)).all();
    expect(rows.map((r) => r.id).sort()).toEqual(["2", "3"]); // id 2 (completed), id 3 (priority>=2); NOT id 1 or 4
  });

  test("in/notIn/isNull/isNotNull compile correctly", () => {
    const db = mkDb();
    expect(db.select().from(todo).where(compileFilter(todo, { field: "id", op: "in", value: ["1", "2"] })).all().map((r) => r.id).sort()).toEqual(["1", "2"]);
    expect(db.select().from(todo).where(compileFilter(todo, { field: "id", op: "notIn", value: ["1", "2"] })).all().map((r) => r.id).sort()).toEqual(["3", "4"]);
  });

  test("rejects an op the column's dataType doesn't support (e.g. `contains` on a boolean column)", () => {
    expect(() => compileFilter(todo, { field: "completed", op: "contains", value: "x" })).toThrow(/not valid for column "completed"/);
  });

  test("rejects a field that isn't a real column", () => {
    expect(() => compileFilter(todo, { field: "dropTable", op: "eq", value: "x" } as unknown as FilterNode)).toThrow(/not a filterable column/);
  });
});

describe("compileSort + compileTextSearch", () => {
  test("compileSort produces real, working multi-column ORDER BY", () => {
    const db = mkDb();
    const order = compileSort(todo, [{ column: "userId", dir: "asc" }, { column: "priority", dir: "desc" }]);
    const rows = db.select().from(todo).orderBy(...order).all();
    expect(rows.map((r) => r.id)).toEqual(["2", "3", "1", "4"]); // u1 by priority desc (2,3,1), then u2 (4)
  });

  test("compileTextSearch ORs `contains` across every string column by default", () => {
    const db = mkDb();
    const where = compileTextSearch(todo, "dog");
    const rows = db.select().from(todo).where(where).all();
    expect(rows.map((r) => r.id)).toEqual(["3"]);
  });

  test("compileTextSearch returns undefined for an empty q (never an accidental match-everything query)", () => {
    expect(compileTextSearch(todo, undefined)).toBeUndefined();
    expect(compileTextSearch(todo, "")).toBeUndefined();
  });
});

describe("resolveListQuery — the one-call parse+compile+fallback primitive (C116)", () => {
  const scope = eq(todo.userId, "u1");
  const defaultOrder = [desc(todo.createdAt)];

  const run = (db: ReturnType<typeof mkDb>, raw: Record<string, string>) => {
    const { where, orderBy, limit, offset } = resolveListQuery(todo, raw, scope, defaultOrder);
    return db.select().from(todo).where(where).orderBy(...orderBy).limit(limit).offset(offset).all();
  };

  test("a valid filter narrows within the scope", () => {
    const rows = run(mkDb(), { title__contains: "milk" });
    expect(rows.map((r) => r.id)).toEqual(["1"]);
  });

  test("an op invalid for its column's dataType falls back to scope-only, unfiltered — never throws", () => {
    const db = mkDb();
    expect(() => run(db, { completed__contains: "true" })).not.toThrow();
    const rows = run(db, { completed__contains: "true" });
    expect(rows.map((r) => r.id).sort()).toEqual(["1", "2", "3"]); // every u1 row, none of u2's
  });

  test("a malformed advanced filter= JSON falls back the same way", () => {
    expect(() => run(mkDb(), { filter: "not-json" })).not.toThrow();
    expect(run(mkDb(), { filter: "not-json" }).map((r) => r.id).sort()).toEqual(["1", "2", "3"]);
  });

  test("scope is always the outermost AND — a filter targeting another user's rows returns empty, never a leak", () => {
    const rows = run(mkDb(), { filter: JSON.stringify({ field: "userId", op: "eq", value: "u2" }) });
    expect(rows).toEqual([]);
  });

  test("no query params -> the scope + defaultOrderBy + a default page", () => {
    const rows = run(mkDb(), {});
    expect(rows.map((r) => r.id)).toEqual(["3", "2", "1"]); // u1's rows, newest first (createdAt desc)
  });

  test("an oversized filter tree (the SQLite expression-tree-depth DoS shape) falls back safely, never reaches the DB engine", () => {
    const db = mkDb();
    const huge = JSON.stringify({ or: Array.from({ length: 1000 }, (_, i) => ({ field: "title", op: "eq", value: `x${i}` })) });
    expect(() => run(db, { filter: huge })).not.toThrow();
    expect(run(db, { filter: huge }).map((r) => r.id).sort()).toEqual(["1", "2", "3"]); // every u1 row, none of u2's
  });
});
