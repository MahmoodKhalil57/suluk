/**
 * The route ENVELOPE (`routeGroup`) — a module builds ONE of these up as it declares its routes, then it bubbles up two
 * ways so the contract is *organic* (defined by the routes themselves) instead of restated in a separate higher-level
 * `<module>.contract.ts` file:
 *
 *   • `.ops` — the module's CONTRACT fragment: every handler-backed route's `contract` + every doc-only op, in author
 *     order. `contractDoc(...)` reads a group directly (it flattens `.ops`), and the generator's `src/contract.ops.ts`
 *     spreads `...<module>.ops` — so the v4 document / scope gate / SDK are DERIVED FROM the routes, never a hand-kept list.
 *   • `.router()` — a fresh Hono sub-router with each handler mounted at its path RELATIVE to `basePath`, so the app mounts
 *     the whole module with `app.route(basePath, group.router())` and never restates a per-route `app.get(...)` line.
 *
 * The single source of truth is the route definition: its `contract` bubbles up into `.ops`, its `handler` into
 * `.router()`. Add a route → both the doc and the mount update; there is nothing else to keep in sync.
 */
import { Hono } from "hono";
import type { Context } from "hono";
import type { DocumentedRoute } from "./contract";

/**
 * A handler-backed route — the STRUCTURAL shape `@suluk/effect`'s `effectRoute` returns (`{ contract, handler }`). Kept
 * structural (not an import of `@suluk/effect`) so `@suluk/hono` need not depend on the package that depends on IT: any
 * value carrying a documented `contract` + a Hono `handler` qualifies (effectRoute results, or a hand-rolled pair).
 */
export interface HandlerRoute {
  readonly contract: DocumentedRoute;
  readonly handler: (c: Context) => Response | Promise<Response>;
}

/** The envelope a module exports. Built up with `.route()` / `.doc()`; bubbled up via `.ops` (the contract) + `.router()`. */
export interface RouteGroup {
  /** The base path the group mounts at (its sub-router's mount point). */
  readonly basePath: string;
  /**
   * Register a handler-backed route (an `effectRoute(...)` result, or any `{ contract, handler }`) — MOUNTED and DOCUMENTED.
   * The common case. Returns it UNCHANGED, so you may keep a local reference: `const debit = group.route(effectRoute({...}))`.
   */
  route<R extends HandlerRoute>(r: R): R;
  /**
   * Register a handler-backed route that is MOUNTED but NOT DOCUMENTED — it serves over the wire (or via `internalFetch`)
   * yet contributes nothing to `.ops`. For an ops/internal handler the contract deliberately omits (e.g. an
   * account-verification email endpoint whose primary trigger is a Better-Auth hook). Returns it unchanged.
   */
  mountOnly<R extends HandlerRoute>(r: R): R;
  /**
   * Register a DOC-ONLY op — one that belongs in the contract (doc, scope gate, SDK) but has no handler in this module
   * (e.g. `getCredits`, a documented read the contract-matcher resolves `/api/credits/*` requests against). It contributes
   * to `.ops` only; `.router()` never mounts it.
   */
  doc<D extends DocumentedRoute>(op: D): D;
  /** The contract fragment — the ops this module contributes, in author order. `contractDoc` reads this automatically. */
  readonly ops: readonly DocumentedRoute[];
  /** A fresh Hono sub-router with each handler-backed route mounted at its `basePath`-relative sub-path. */
  router(): Hono;
}

/** Type guard — is `x` a {@link RouteGroup}? (Structural: it exposes `.ops` + a `.router()` factory.) */
export function isRouteGroup(x: unknown): x is RouteGroup {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as RouteGroup).router === "function" &&
    Array.isArray((x as { ops?: unknown }).ops)
  );
}

/**
 * Create a route envelope mounted at `basePath` (e.g. `"/api/credits"`). Author routes with `.route(effectRoute({...}))`
 * and doc-only ops with `.doc({...})`; then export `.ops` (the contract fragment) + `.router()` (the mounted handlers).
 */
export function routeGroup(basePath: string): RouteGroup {
  // `documented` → contributes to `.ops`; `handler` → mounted by `.router()`. The three registrars pick the two flags:
  // route = both, mountOnly = handler only, doc = documented only.
  const entries: { contract: DocumentedRoute; handler?: HandlerRoute["handler"]; documented: boolean }[] = [];

  // A route's full contract path (`/api/credits/debit`) → its path RELATIVE to `basePath` (`/debit`), so the whole group
  // mounts under `app.route(basePath, group.router())`. Exact-base → "/"; anything not under basePath mounts at its full
  // path (defensive — a group should only hold routes under its base).
  const rel = (full: string): string => {
    if (basePath === "" || basePath === "/") return full || "/";
    if (full === basePath) return "/";
    if (full.startsWith(basePath + "/")) return full.slice(basePath.length);
    return full;
  };

  return {
    basePath,
    route(r) {
      entries.push({ contract: r.contract, handler: r.handler, documented: true });
      return r;
    },
    mountOnly(r) {
      entries.push({ contract: r.contract, handler: r.handler, documented: false });
      return r;
    },
    doc(op) {
      entries.push({ contract: op, documented: true });
      return op;
    },
    get ops(): readonly DocumentedRoute[] {
      return entries.filter((e) => e.documented).map((e) => e.contract);
    },
    router(): Hono {
      const app = new Hono();
      for (const e of entries) {
        if (!e.handler) continue; // a doc-only op — nothing to mount
        app.on(e.contract.method.toUpperCase(), rel(e.contract.path), e.handler as Parameters<Hono["on"]>[2]);
      }
      return app;
    },
  };
}
