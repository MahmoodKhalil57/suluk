/**
 * `@suluk/cloudflare/local` — the MOCK Cloudflare bindings for local dev, so a Worker app runs under **bun** with zero
 * Cloudflare account and no wrangler/miniflare: a `D1Database` facade over `bun:sqlite` (a plain file) and a `KVNamespace`
 * facade over a JSON file. These are DEV-ONLY and imported ONLY by the generated `src/dev.ts` — never by `src/index.ts`,
 * so `bun:sqlite` never enters the deployed Worker bundle. The selection is presence-based: the app uses its REAL binding
 * (`env.DB` / `env.RATE_CREDIT_KV`) when present, and `src/dev.ts` supplies these facades when it isn't (mock-until-keyed).
 *
 * This is a SEPARATE entry point (`bun:sqlite` import) from the package's Worker/Node-safe root — do not re-export it there.
 */
import { Database } from "bun:sqlite";
import { is } from "drizzle-orm";
import { getTableConfig, SQLiteTable } from "drizzle-orm/sqlite-core";

// ── D1 over bun:sqlite ────────────────────────────────────────────────────────────────────────────────────────────────
// The exact contract drizzle-orm/d1 drives: `db.prepare(sql)`, `stmt.bind(...params)`, then `stmt.all()` → `{ results }`,
// `stmt.run()`, `stmt.raw()` → rows-as-arrays, and `db.batch(stmts)`. Verified end-to-end (insert…returning, placeholder
// selects, update, column projection) against drizzle-orm/d1's D1Session.

/** The slice of the D1 result shape drizzle reads (`.results`); `meta` carries write stats for `.run()`. */
export interface D1LikeResult<T = Record<string, unknown>> { results: T[]; success: boolean; meta: Record<string, unknown> }

/** A D1PreparedStatement facade over a bun:sqlite query. `bind` returns a fresh bound statement (drizzle chains it). */
export interface D1LikeStatement {
  bind(...values: unknown[]): D1LikeStatement;
  all<T = Record<string, unknown>>(): Promise<D1LikeResult<T>>;
  run<T = Record<string, unknown>>(): Promise<D1LikeResult<T>>;
  raw<T = unknown>(): Promise<T[]>;
  first<T = unknown>(colName?: string): Promise<T | null>;
}

/** A D1Database facade over a bun:sqlite handle. Assignable to the Workers `D1Database` where the app expects `env.DB`. */
export interface D1Like {
  prepare(query: string): D1LikeStatement;
  batch<T = Record<string, unknown>>(statements: D1LikeStatement[]): Promise<D1LikeResult<T>[]>;
  exec(query: string): Promise<{ count: number; duration: number }>;
  dump(): Promise<ArrayBuffer>;
}

function makeStmt(db: Database, sql: string, bound: unknown[] = []): D1LikeStatement {
  return {
    bind: (...values: unknown[]) => makeStmt(db, sql, values),
    all: async () => ({ results: db.query(sql).all(...(bound as never[])) as never[], success: true, meta: {} }),
    run: async () => {
      const r = db.query(sql).run(...(bound as never[]));
      return { results: [] as never[], success: true, meta: { changes: r.changes, last_row_id: Number(r.lastInsertRowid), rows_written: r.changes } };
    },
    raw: async () => db.query(sql).values(...(bound as never[])) as never[],
    first: async (colName?: string) => {
      const row = db.query(sql).get(...(bound as never[])) as Record<string, unknown> | null;
      if (row == null) return null;
      return (colName ? row[colName] : row) as never;
    },
  };
}

/**
 * Build a D1-shaped facade over a `bun:sqlite` database. Pass a path (a file, or `":memory:"`) or an open `Database`.
 * The `DbLive(env)` layer stays byte-for-byte unchanged — `drizzle(env.DB)` works because this satisfies drizzle-orm/d1.
 */
export function d1FromSqlite(dbOrPath: Database | string = ":memory:"): D1Like {
  const db = typeof dbOrPath === "string" ? new Database(dbOrPath, { create: true }) : dbOrPath;
  // WAL for concurrent reads; FKs left OFF (the mock doesn't enforce referential integrity — `applyLocalSchema` omits FK DDL).
  db.exec("PRAGMA journal_mode = WAL;");
  return {
    prepare: (sql: string) => makeStmt(db, sql),
    // D1.batch is transactional in prod; the mock runs the statements in a bun:sqlite transaction for get/all parity.
    batch: async (statements) => db.transaction(() => Promise.all(statements.map((s) => s.all())))() as never,
    exec: async (query: string) => { db.exec(query); return { count: 0, duration: 0 }; },
    dump: async () => new ArrayBuffer(0),
  };
}

// ── KV over a JSON file ───────────────────────────────────────────────────────────────────────────────────────────────
// A KVNamespace facade backed by a single JSON file. Covers the surface an app drives (get / put / delete / list /
// getWithMetadata) with TTL expiry honoured at read time. Single-writer (one bun dev process); writes are atomic
// (temp-file + rename) so a crash mid-write never corrupts the store.

interface KvEntry { value: string; expiresAt: number | null; metadata: unknown }
type KvFile = Record<string, KvEntry>;

/** The KVNamespace surface this facade implements — assignable where the app expects `env.RATE_CREDIT_KV`. */
export interface KvNamespaceLike {
  get(key: string, options?: unknown): Promise<string | null>;
  getWithMetadata(key: string): Promise<{ value: string | null; metadata: unknown }>;
  put(key: string, value: string, options?: { expirationTtl?: number; expiration?: number; metadata?: unknown }): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{ keys: { name: string; expiration?: number; metadata?: unknown }[]; list_complete: boolean; cursor?: string }>;
}

/** Build a KVNamespace facade over a JSON file at `path`. Created on first write; expired keys read as `null`. */
export function jsonFileKvStore(path: string): KvNamespaceLike {
  const load = (): KvFile => {
    try { return JSON.parse(require("node:fs").readFileSync(path, "utf8")) as KvFile; } catch { return {}; }
  };
  const save = (data: KvFile) => {
    const fs = require("node:fs") as typeof import("node:fs");
    const dir = require("node:path").dirname(path);
    fs.mkdirSync(dir, { recursive: true });
    const tmp = `${path}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data));
    fs.renameSync(tmp, path); // atomic within a filesystem
  };
  const live = (e: KvEntry | undefined): boolean => !!e && (e.expiresAt == null || e.expiresAt > Date.now());
  return {
    async get(key) { const e = load()[key]; return live(e) ? e!.value : null; },
    async getWithMetadata(key) { const e = load()[key]; return live(e) ? { value: e!.value, metadata: e!.metadata ?? null } : { value: null, metadata: null }; },
    async put(key, value, options) {
      const data = load();
      const ttl = options?.expirationTtl;
      const exp = options?.expiration;
      data[key] = { value, expiresAt: ttl != null ? Date.now() + ttl * 1000 : exp != null ? exp * 1000 : null, metadata: options?.metadata ?? null };
      save(data);
    },
    async delete(key) { const data = load(); delete data[key]; save(data); },
    async list(options) {
      const data = load();
      const prefix = options?.prefix ?? "";
      const keys = Object.entries(data).filter(([k, e]) => k.startsWith(prefix) && live(e)).map(([name, e]) => ({ name, ...(e.expiresAt != null ? { expiration: Math.floor(e.expiresAt / 1000) } : {}), metadata: e.metadata ?? undefined }));
      const limit = options?.limit ?? 1000;
      return { keys: keys.slice(0, limit), list_complete: keys.length <= limit, cursor: undefined };
    },
  };
}

// ── Local mailbox over a JSON file ────────────────────────────────────────────────────────────────────────────────────
// A mailbox sink for @suluk/email's storeProvider: captures "sent" emails to a JSON file so local dev has an inspectable
// inbox with no mail server. Structurally satisfies @suluk/email's MailboxSink (no cross-package dep).

interface StoredEmailRec { to: string | string[]; from?: string; replyTo?: string; subject: string; html: string; text?: string; at: string }

/** A JSON-file mailbox sink — `save` appends a captured email; `list` returns them newest-last. */
export function jsonFileMailbox(path: string): { save(email: StoredEmailRec): Promise<void>; list(): Promise<StoredEmailRec[]> } {
  const fs = require("node:fs") as typeof import("node:fs");
  const load = (): StoredEmailRec[] => { try { return JSON.parse(fs.readFileSync(path, "utf8")) as StoredEmailRec[]; } catch { return []; } };
  const persist = (arr: StoredEmailRec[]) => {
    fs.mkdirSync(require("node:path").dirname(path), { recursive: true });
    const tmp = `${path}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(arr, null, 2));
    fs.renameSync(tmp, path);
  };
  return {
    async save(email) { const arr = load(); arr.push(email); persist(arr); },
    async list() { return load(); },
  };
}

// ── Schema-as-code → SQLite DDL ───────────────────────────────────────────────────────────────────────────────────────
// A Suluk app defines its tables as drizzle `sqliteTable()` objects (in `src/db/*.ts`, re-exported from `@suluk/*`); there
// are no .sql migrations — `@suluk/provision` applies the DDL to D1 out-of-band. Local dev has no provision step, so we
// derive the same CREATE TABLE DDL straight from the drizzle objects and apply it to the bun:sqlite file at boot. FK
// constraints are omitted (dev data; avoids insert-order coupling) and non-unique indexes are skipped (perf-only).

/** Generate `CREATE TABLE IF NOT EXISTS` DDL (+ unique indexes) for one drizzle SQLite table. */
export function tableDDL(table: SQLiteTable): string[] {
  const cfg = getTableConfig(table);
  const cols = cfg.columns.map((c) => {
    let s = `"${c.name}" ${c.getSQLType()}`;
    if (c.primary) s += " PRIMARY KEY";
    if (c.notNull) s += " NOT NULL";
    if (c.isUnique) s += " UNIQUE";
    const def = (c as { default?: unknown; hasDefault?: boolean }).default;
    if ((c as { hasDefault?: boolean }).hasDefault && def !== undefined) s += ` DEFAULT ${typeof def === "string" ? `'${def}'` : def}`;
    return s;
  });
  const compositePk = cfg.primaryKeys.map((pk) => `PRIMARY KEY (${pk.columns.map((col) => `"${col.name}"`).join(", ")})`);
  const create = `CREATE TABLE IF NOT EXISTS "${cfg.name}" (\n  ${[...cols, ...compositePk].join(",\n  ")}\n);`;
  const uniques = cfg.uniqueConstraints.map((u, i) => `CREATE UNIQUE INDEX IF NOT EXISTS "${cfg.name}_u${i}" ON "${cfg.name}" (${u.columns.map((col) => `"${col.name}"`).join(", ")});`);
  return [create, ...uniques];
}

/** Collect the drizzle SQLite tables exported by a set of imported schema modules (namespace objects), de-duped by name. */
export function collectTables(modules: Record<string, unknown>[]): SQLiteTable[] {
  const out: SQLiteTable[] = [];
  const seen = new Set<string>();
  for (const mod of modules)
    for (const v of Object.values(mod))
      if (is(v, SQLiteTable)) {
        const n = getTableConfig(v).name;
        if (!seen.has(n)) { seen.add(n); out.push(v); }
      }
  return out;
}

/**
 * Discover the app's schema (every `sqliteTable` exported under `dir`, default `src/db`) and apply its DDL to `db`. Runs
 * at bun-dev boot so a fresh sqlite file has the full schema. Returns the created table names. Idempotent (`IF NOT EXISTS`).
 */
export async function applyLocalSchema(db: Database, opts: { dir?: string; extra?: SQLiteTable[] } = {}): Promise<string[]> {
  const dir = opts.dir ?? "src/db";
  const modules: Record<string, unknown>[] = [];
  // Bun.Glob — resolve each schema file to an absolute path so the dynamic import works regardless of cwd nesting.
  const glob = new Bun.Glob("*.ts");
  const cwd = process.cwd();
  for await (const file of glob.scan({ cwd: `${cwd}/${dir}`, absolute: true })) modules.push(await import(file));
  const tables = [...collectTables(modules), ...(opts.extra ?? [])];
  db.exec("PRAGMA foreign_keys = OFF;");
  const names: string[] = [];
  for (const t of tables) {
    try { for (const stmt of tableDDL(t)) db.exec(stmt); names.push(getTableConfig(t).name); }
    catch (e) { console.warn(`[suluk local] skipped table ${getTableConfig(t).name}: ${e instanceof Error ? e.message : e}`); }
  }
  return names;
}
