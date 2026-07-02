import { test, expect } from "bun:test";
import { drizzle } from "drizzle-orm/d1";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { eq } from "drizzle-orm";
import { CloudflareClient } from "../src/client";
import { d1FromHttp, httpKvStore } from "../src/live";

const users = sqliteTable("users", { id: text("id").primaryKey(), email: text("email").notNull(), credits: integer("credits").notNull() });

/** A CloudflareClient with request/requestText stubbed to simulate the D1 /query + KV HTTP endpoints in memory. */
function fakeCf() {
  const calls: { d1: { sql: string; params?: unknown[] }[]; kv: string[] } = { d1: [], kv: [] };
  const kv = new Map<string, string>();
  const cf = new CloudflareClient({ apiToken: "t", accountId: "acc" });
  (cf as any).request = async (method: string, path: string, opts: any = {}) => {
    if (path.includes("/d1/database/") && path.endsWith("/query")) {
      calls.d1.push({ sql: opts.json.sql, params: opts.json.params });
      // simulate a single-row SELECT result in the D1 envelope [{ results, success, meta }]
      const rows = /^select/i.test(opts.json.sql.trim()) ? [{ id: "u1", email: "a@b.com", credits: 7 }] : [];
      return [{ results: rows, success: true, meta: { changes: 1 } }];
    }
    if (path.includes("/storage/kv/") && path.includes("/values/")) {
      const key = decodeURIComponent(path.split("/values/")[1]);
      if (method === "PUT") { kv.set(key, opts.body); calls.kv.push(`put:${key}`); return {}; }
      if (method === "DELETE") { kv.delete(key); return {}; }
    }
    return null;
  };
  (cf as any).requestText = async (_m: string, path: string) => {
    const key = decodeURIComponent(path.split("/values/")[1] ?? "");
    return kv.has(key) ? kv.get(key)! : null;
  };
  return { cf, calls };
}

test("d1FromHttp drives drizzle-orm/d1: a select round-trips through the HTTP envelope with bound params", async () => {
  const { cf, calls } = fakeCf();
  const db = drizzle(d1FromHttp(cf, "db-123") as never);
  const rows = await db.select().from(users).where(eq(users.email, "a@b.com"));
  expect(rows[0]?.id).toBe("u1");
  expect(rows[0]?.credits).toBe(7);
  // the parameter went through the D1 /query params array (never string-interpolated)
  expect(calls.d1[0].params).toEqual(["a@b.com"]);
  expect(calls.d1[0].sql).toContain("where");
});

test("httpKvStore: put/get/delete map to the KV HTTP verbs", async () => {
  const { cf, calls } = fakeCf();
  const kv = httpKvStore(cf, "ns-1");
  expect(await kv.get("missing")).toBeNull();
  await kv.put("rc:1", JSON.stringify({ balance: 5 }));
  expect(JSON.parse((await kv.get("rc:1"))!)).toEqual({ balance: 5 });
  expect(calls.kv).toContain("put:rc:1");
  await kv.delete("rc:1");
  expect(await kv.get("rc:1")).toBeNull();
});
