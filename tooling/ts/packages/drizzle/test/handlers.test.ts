/**
 * crudHandlers — the driver-agnostic gated CRUD factory. Driven through a real Hono app over a bun:sqlite drizzle
 * instance (so the awaited terminals .all()/.get()/.returning()/.run() are exercised exactly as the Worker runs them
 * on D1). Covers owner-scoping, the access modes' gate (anon→401, non-admin→403), redaction, the afterUpdate hook,
 * list filters + pagination, and create owner-stamp + update id/owner strip.
 */
import { test, expect, describe, beforeEach } from "bun:test";
import { Hono, type Context } from "hono";
import { Database } from "bun:sqlite";
import { drizzle, type BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { crudHandlers, schemaDDL, type CrudDb } from "../src/index";

const thing = sqliteTable("thing", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerId: text("owner_id"),
  name: text("name").notNull(),
  secret: text("secret"), // a "private" column redacted from non-admin reads
});

let sqlite: Database, db: BunSQLiteDatabase;
function appFor(access: "owned" | "public" | "admin", hook?: { fired: string[] }) {
  const app = new Hono();
  const h = crudHandlers(thing, {
    access, ownerCol: access === "owned" ? "ownerId" : undefined,
    db: () => db as unknown as CrudDb,
    principal: (c: Context) => c.req.header("x-user") ?? null,
    isAdmin: (c: Context) => c.req.header("x-admin") === "1",
    redact: (_t, row, admin) => { if (admin) return row; const { secret, ...rest } = row; return rest; },
    afterUpdate: async (_t, _c, _db, before, after) => { hook?.fired.push(`${before.name}->${after.name}`); },
    afterUpdateTables: new Set(["thing"]),
  });
  app.get("/thing", h.list); app.get("/thing/:id", h.get); app.post("/thing", h.create);
  app.patch("/thing/:id", h.update); app.delete("/thing/:id", h.delete);
  return app;
}
const J = (extra: Record<string, string> = {}) => ({ headers: { "content-type": "application/json", ...extra } });

beforeEach(() => { sqlite = new Database(":memory:"); sqlite.exec(schemaDDL([thing])); db = drizzle(sqlite); });

describe("owned access — owner-scoping + gate", () => {
  test("anon list/create → 401; owner sees only own rows; admin sees all", async () => {
    const app = appFor("owned");
    expect((await app.request("/thing")).status).toBe(401); // owner op, anon
    expect((await app.request("/thing", { method: "POST", ...J({ "x-user": "A" }), body: '{"name":"a1","ownerId":"HACK"}' })).status).toBe(201);
    await app.request("/thing", { method: "POST", ...J({ "x-user": "B" }), body: '{"name":"b1"}' });
    const aList = await (await app.request("/thing", { headers: { "x-user": "A" } })).json();
    expect(aList.length).toBe(1); expect(aList[0].name).toBe("a1");
    expect(aList[0].ownerId).toBe("A"); // create STAMPED the owner from principal, ignoring the body's "HACK"
    const bList = await (await app.request("/thing", { headers: { "x-user": "B" } })).json();
    expect(bList.length).toBe(1); expect(bList[0].name).toBe("b1");
    const adminList = await (await app.request("/thing", { headers: { "x-admin": "1", "x-user": "Z" } })).json();
    expect(adminList.length).toBe(2); // admin sees all
  });

  test("get/update/delete are owner-scoped (B can't touch A's row)", async () => {
    const app = appFor("owned");
    await app.request("/thing", { method: "POST", ...J({ "x-user": "A" }), body: '{"name":"a1"}' });
    expect((await app.request("/thing/1", { headers: { "x-user": "A" } })).status).toBe(200);
    expect((await app.request("/thing/1", { headers: { "x-user": "B" } })).status).toBe(404); // scoped away
    expect((await app.request("/thing/1", { method: "PATCH", ...J({ "x-user": "B" }), body: '{"name":"hax"}' })).status).toBe(404);
    expect((await app.request("/thing/1", { method: "DELETE", headers: { "x-user": "A" } })).status).toBe(204);
  });
});

describe("redaction + afterUpdate hook", () => {
  test("non-admin reads omit the private column; admin sees it", async () => {
    const app = appFor("public");
    await app.request("/thing", { method: "POST", ...J({ "x-admin": "1", "x-user": "admin" }), body: '{"name":"p","secret":"sssh"}' });
    const anon = await (await app.request("/thing")).json();
    expect(anon[0]).not.toHaveProperty("secret");
    const admin = await (await app.request("/thing", { headers: { "x-admin": "1", "x-user": "admin" } })).json();
    expect(admin[0].secret).toBe("sssh");
  });

  test("update fires the afterUpdate hook with before/after + strips id/owner from the body", async () => {
    const fired: string[] = []; const app = appFor("owned", { fired });
    await app.request("/thing", { method: "POST", ...J({ "x-user": "A" }), body: '{"name":"old"}' });
    const res = await app.request("/thing/1", { method: "PATCH", ...J({ "x-user": "A" }), body: '{"name":"new","id":999,"ownerId":"HACK"}' });
    const row = await res.json();
    expect(row.id).toBe(1); expect(row.ownerId).toBe("A"); expect(row.name).toBe("new"); // id/owner not moved
    expect(fired).toEqual(["old->new"]);
  });
});

describe("public + admin modes + list features", () => {
  test("public: anon reads, admin writes", async () => {
    const app = appFor("public");
    expect((await app.request("/thing")).status).toBe(200); // anyone reads
    expect((await app.request("/thing", { method: "POST", ...J(), body: '{"name":"x"}' })).status).toBe(401); // create=admin, anon
    expect((await app.request("/thing", { method: "POST", ...J({ "x-user": "u" }), body: '{"name":"x"}' })).status).toBe(403); // signed-in non-admin
    expect((await app.request("/thing", { method: "POST", ...J({ "x-admin": "1", "x-user": "admin" }), body: '{"name":"x"}' })).status).toBe(201);
  });

  test("list filters by a real column + paginates opt-in", async () => {
    const app = appFor("public");
    for (const n of ["k", "k", "z"]) await app.request("/thing", { method: "POST", ...J({ "x-admin": "1", "x-user": "admin" }), body: JSON.stringify({ name: n }) });
    const filtered = await (await app.request("/thing?name=k")).json();
    expect(filtered.length).toBe(2);
    const page = await (await app.request("/thing?perPage=1&page=1")).json();
    expect(page.length).toBe(1);
  });
});
