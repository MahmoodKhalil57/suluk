/**
 * `@suluk/cloudflare/live` (C058) — the LIVE Cloudflare bindings for local dev over the HTTP API, so a bun process attaches
 * to the SAME D1/KV a deployed Worker binds. A `D1Database` facade over `queryD1` (the D1 /query HTTP endpoint) and a
 * `KVNamespace` facade over `kvGet`/`kvPut`/`kvDelete` — both satisfy the EXACT `D1Like`/`KvNamespaceLike` contracts from
 * `./local`, so `drizzle(env.DB)` + every KV consumer are byte-for-byte unchanged. This is the "single environment, two
 * runtimes" seam: once provisioned (minted CF token + account + binding id present), `src/dev.ts` swaps the sqlite/json MOCK
 * for these; a fresh app keeps mocking (MOCK-UNTIL-KEYED). Imported ONLY by `src/dev.ts` (never the Worker) — no fs, no
 * bun:sqlite; the D1Like/KvNamespaceLike types are TYPE-ONLY imports so nothing from `./local` (which imports bun:sqlite) is
 * pulled at runtime.
 */
import { CloudflareClient } from "./client";
import { queryD1, d1Rows, kvGet, kvPut, kvDelete, kvList } from "./resources";
import type { D1Like, D1LikeStatement, D1LikeResult, KvNamespaceLike } from "./local";

type D1Row = Record<string, unknown>;
// the D1 /query response is `[{ results, success, meta }]` (one per `;`-separated statement) — take the last (matches d1Rows).
const lastStmt = (raw: unknown): { results?: D1Row[]; meta?: Record<string, unknown> } => {
  const arr = Array.isArray(raw) ? (raw as { results?: D1Row[]; meta?: Record<string, unknown> }[]) : [];
  return arr[arr.length - 1] ?? {};
};

function stmt(cf: CloudflareClient, dbId: string, sql: string, bound: unknown[] = []): D1LikeStatement {
  // lazy: buffer bound params, defer the HTTP round-trip until all/run/first/raw (drizzle chains `.bind(...).all()`).
  const s: D1LikeStatement = {
    bind: (...v: unknown[]) => stmt(cf, dbId, sql, v),
    all: async () => { const r = lastStmt(await queryD1(cf, dbId, sql, bound)); return { results: (r.results ?? []) as never[], success: true, meta: r.meta ?? {} }; },
    run: async () => { const r = lastStmt(await queryD1(cf, dbId, sql, bound)); return { results: [] as never[], success: true, meta: r.meta ?? {} }; },
    first: async (col?: string) => { const rows = d1Rows(await queryD1(cf, dbId, sql, bound)); const row = rows[0] ?? null; return (row == null ? null : col ? row[col] : row) as never; },
    // D1's JSON rows preserve SELECT column order, so Object.values gives positional (raw) rows. Rarely used (drizzle .values()).
    raw: async () => d1Rows(await queryD1(cf, dbId, sql, bound)).map((r) => Object.values(r)) as never[],
  };
  return s;
}

/** Build a D1Database facade over the CF HTTP API. `cf` carries the minted D1 token + account; `databaseId` = the D1 id. */
export function d1FromHttp(cf: CloudflareClient, databaseId: string): D1Like {
  return {
    prepare: (sql: string) => stmt(cf, databaseId, sql),
    // NOTE: D1 /query auto-commits per call — this batch is SEQUENTIAL, not atomic (drizzle's transaction() atomicity is
    // lost over HTTP). The only wired local write-path (signup-grant → credits.grantOnce) is idempotent-by-key, so a partial
    // failure self-heals on retry. Documented, not pretended.
    batch: async (statements) => { const out: unknown[] = []; for (const s of statements) out.push(await s.all()); return out as never; },
    exec: async (query: string) => { await queryD1(cf, databaseId, query); return { count: 0, duration: 0 }; },
    dump: async () => new ArrayBuffer(0),
  };
}

/** Build a KVNamespace facade over the CF HTTP API. `cf` carries the minted KV token + account; `namespaceId` = the KV id. */
export function httpKvStore(cf: CloudflareClient, namespaceId: string): KvNamespaceLike {
  return {
    get: (key: string) => kvGet(cf, namespaceId, key),
    getWithMetadata: async (key: string) => ({ value: await kvGet(cf, namespaceId, key), metadata: null }),
    put: (key: string, value: string, options?: { expirationTtl?: number }) => kvPut(cf, namespaceId, key, value, { expirationTtl: options?.expirationTtl }),
    delete: (key: string) => kvDelete(cf, namespaceId, key),
    list: async (options?: { prefix?: string; limit?: number }) => {
      const names = await kvList(cf, namespaceId, options?.prefix);
      const keys = names.slice(0, options?.limit ?? 1000).map((name) => ({ name }));
      return { keys, list_complete: true, cursor: undefined };
    },
  };
}
