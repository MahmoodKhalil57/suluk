/**
 * Generic gated CRUD HANDLERS for a drizzle table — written ONCE, driver-agnostic, so a dev server (bun:sqlite,
 * synchronous) and a Workers runtime (D1, async) share ONE implementation instead of two hand-copied twins that
 * drift. The db is injected as a RESOLVER `(c) => drizzle-instance` (dev: `() => db`; worker: `(c) => drizzle(c.env.DB)`),
 * and every query uses an explicit awaited terminal (`.all()/.get()/.returning()/.run()`) that BOTH drivers support
 * — `await` is transparent over bun:sqlite's synchronous results, so one async factory serves both.
 *
 * ACCESS is the @suluk/hono row-level engine: each entity's mode → per-op {@link gate} decision (anon→401 on an
 * owner/admin op, non-admin→403 on an admin op) + owner-scoping (a signed-in caller only sees/mutates their rows).
 * Optional `redact` strips private columns from non-admin reads; optional `afterUpdate` fires a post-update hook.
 */
import { and, eq, asc, desc, getTableName, type SQL } from "drizzle-orm";
import type { Context } from "hono";
import type { SQLiteColumn, SQLiteTable } from "drizzle-orm/sqlite-core";
import { gate, policyFor, type AccessMode, type Policy } from "@suluk/hono";
import { parseListQuery } from "./query";

type AnyRow = Record<string, unknown>;
/** Structural drizzle handle — the chainable builder API both bun:sqlite and D1 expose (loosely typed, like the app twins). */
export interface CrudDb { select: (...a: unknown[]) => any; insert: (...a: unknown[]) => any; update: (...a: unknown[]) => any; delete: (...a: unknown[]) => any } // eslint-disable-line @typescript-eslint/no-explicit-any

export interface CrudHandlers {
  list: (c: Context) => Promise<Response>;
  get: (c: Context) => Promise<Response>;
  create: (c: Context) => Promise<Response>;
  update: (c: Context) => Promise<Response>;
  delete: (c: Context) => Promise<Response>;
}

export interface CrudHandlerOptions {
  ownerCol?: string;
  access?: AccessMode;
  /** override the default mode→policy preset (passed through to @suluk/hono's policyFor). */
  policies?: Record<AccessMode, Policy>;
  /** resolve the drizzle instance for a request (dev: `() => db`; worker: `(c) => drizzle(c.env.DB)`). */
  db: (c: Context) => CrudDb;
  /** the verified caller id (token/session/x-user) — used for owner-scoping + the create owner-stamp. */
  principal: (c: Context) => string | null;
  /** whether the caller is an admin (e.g. `c.get("isAdmin") === true`). */
  isAdmin: (c: Context) => boolean;
  /** strip private columns from a row for a non-admin reader (no-op by default). */
  redact?: (tableName: string, row: AnyRow, admin: boolean) => AnyRow;
  /** post-update hook (e.g. back-in-stock on a restock); fires only for tables in `afterUpdateTables`. */
  afterUpdate?: (tableName: string, c: Context, db: CrudDb, before: AnyRow, after: AnyRow) => Promise<void>;
  afterUpdateTables?: ReadonlySet<string>;
}

const denied = (c: Context, g: { status?: 401 | 403 }) => c.json({ error: g.status === 401 ? "unauthorized" : "forbidden" }, g.status ?? 403);

/** Build the five gated CRUD handlers for a drizzle table. The dev + worker callers differ ONLY in `opts.db`. */
export function crudHandlers(table: SQLiteTable, opts: CrudHandlerOptions): CrudHandlers {
  const cols = table as unknown as Record<string, SQLiteColumn>;
  const pk = cols.id;
  const policy = policyFor(opts.access, opts.ownerCol, opts.policies);
  const tname = getTableName(table);
  const redact = opts.redact ?? ((_t, row) => row);
  const numId = (c: Context) => Number(c.req.param("id"));
  const ident = (c: Context) => ({ isAdmin: opts.isAdmin(c), principal: opts.principal(c) });
  // owner-scope (when the rule demands it) AND the pk filter (for one row).
  const scoped = (c: Context, scopeOwner: boolean, withPk: boolean): SQL | undefined => {
    const own = scopeOwner && opts.ownerCol ? eq(cols[opts.ownerCol], opts.principal(c)) : undefined;
    const id = withPk ? eq(pk, numId(c)) : undefined;
    return own && id ? and(id, own) : (id ?? own);
  };
  return {
    list: async (c) => {
      const g = gate(policy.list, ident(c)); if (!g.ok) return denied(c, g);
      const own = scoped(c, g.scopeOwner, false);
      // owner-scope AND per-column equality filters (parseListQuery returns REAL columns only — unknown keys dropped,
      // so a filter can never widen past the owner scope).
      const lq = parseListQuery(c.req.query(), table);
      const conds: SQL[] = [];
      if (own) conds.push(own);
      for (const [col, val] of Object.entries(lq.filters)) if (cols[col]) conds.push(eq(cols[col], val));
      const where = conds.length > 1 ? and(...conds) : conds[0];
      let qb = opts.db(c).select().from(table).$dynamic();
      if (where) qb = qb.where(where);
      if (lq.orderBy && cols[lq.orderBy.column]) qb = qb.orderBy(lq.orderBy.dir === "desc" ? desc(cols[lq.orderBy.column]) : asc(cols[lq.orderBy.column]));
      // pagination OPT-IN: bound the page only when page/perPage is passed — otherwise the full list.
      const raw = c.req.query();
      if (raw.page != null || raw.perPage != null) qb = qb.limit(lq.limit).offset(lq.offset);
      const admin = opts.isAdmin(c);
      return c.json(((await qb.all()) as AnyRow[]).map((row) => redact(tname, row, admin)));
    },
    get: async (c) => {
      const g = gate(policy.get, ident(c)); if (!g.ok) return denied(c, g);
      const r = (await opts.db(c).select().from(table).where(scoped(c, g.scopeOwner, true)!).get()) as AnyRow | undefined;
      return r ? c.json(redact(tname, r, opts.isAdmin(c))) : c.json({ error: "not found" }, 404);
    },
    create: async (c) => {
      const g = gate(policy.create, ident(c)); if (!g.ok) return denied(c, g);
      const body = (await c.req.json().catch(() => ({}))) as AnyRow;
      const owner = opts.ownerCol ? { [opts.ownerCol]: opts.principal(c) } : {}; // stamp the creator/owner
      const r = (await opts.db(c).insert(table).values({ ...body, ...owner }).returning()) as AnyRow[];
      return c.json(r[0], 201);
    },
    update: async (c) => {
      const g = gate(policy.update, ident(c)); if (!g.ok) return denied(c, g);
      const body = (await c.req.json().catch(() => ({}))) as AnyRow;
      delete body.id; if (opts.ownerCol) delete body[opts.ownerCol]; // never let the client move a row's id or owner
      const w = scoped(c, g.scopeOwner, true)!;
      const db = opts.db(c);
      const hooked = !!opts.afterUpdate && !!opts.afterUpdateTables?.has(tname); // pre-read before-row only when a hook needs it
      const before = hooked ? ((await db.select().from(table).where(w).get()) as AnyRow | undefined) : undefined;
      await db.update(table).set(body).where(w).run();
      const r = (await db.select().from(table).where(w).get()) as AnyRow | undefined;
      if (hooked && before && r) await opts.afterUpdate!(tname, c, db, before, r);
      return r ? c.json(r) : c.json({ error: "not found" }, 404);
    },
    delete: async (c) => {
      const g = gate(policy.delete, ident(c)); if (!g.ok) return denied(c, g);
      await opts.db(c).delete(table).where(scoped(c, g.scopeOwner, true)!).run();
      return c.body(null, 204);
    },
  };
}
