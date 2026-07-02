/**
 * The RouteContract — the single source of truth a user authors (minimally), from which every Derivation
 * (the v4 doc, Scalar/Swagger, validation, tests, audit) is projected. It is plain data + Zod schemas, so
 * the pure derivations (emitV4 / audit / contractChecks) need no running server — only mount() touches Hono.
 */
import type * as z from "zod";
import type { SecurityRequirement, SulukRateLimit } from "@suluk/core";
import type { CostModel } from "@suluk/cost";

export type Method = "get" | "post" | "put" | "patch" | "delete" | "head" | "options";

export interface RouteRequest {
  /** Path params (Hono `:name`), as a Zod object. */
  params?: z.ZodType;
  /** Query string, as a Zod object. */
  query?: z.ZodType;
  /** Request headers that participate in the contract, as a Zod object. */
  header?: z.ZodType;
  /** Request body (defaults to application/json). */
  json?: z.ZodType;
  /** Override the body media type. */
  contentType?: string;
  /** Optional concrete example bodies — used by contractChecks to assert example⊨schema. */
  examples?: unknown[];
}

export interface RouteResponse {
  status: number;
  description?: string;
  schema?: z.ZodType;
  /** Defaults to application/json when a schema is present. */
  contentType?: string;
  /** Optional concrete example responses — used by contractChecks. */
  examples?: unknown[];
}

export interface RouteContract {
  method: Method;
  /** Hono-style path, e.g. "/pet/:petId" or "/files/*". Converted to a v4 uriTemplate on emit. */
  path: string;
  /** The operation's v4 by-name handle (C009). Derived from method+path if omitted. */
  name?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  deprecated?: boolean;
  /** ISO date; with EmitContext.now, the operation is marked deprecated once now ≥ this. */
  deprecatedSince?: string;
  /** ISO date; with EmitContext.now, the operation is HIDDEN once now ≥ this (the "when" axis). */
  removedSince?: string;
  /** Explicit by-name security requirements (C014). */
  security?: SecurityRequirement[];
  /** Required scopes. Drives BOTH the per-principal filter (the "who") and synthesized security. */
  scopes?: string[];
  /**
   * Error statuses this operation can return. Synthesized into RFC-9457 error responses by emitV4 (alongside
   * the auto-derived 401/403 for auth-gated ops, 429 when rate-limited, and an always-present 500).
   */
  errors?: number[];
  /**
   * The declared rate budget (the `x-suluk-ratelimit` facet). emitV4 stamps it onto the operation + synthesizes a
   * 429 response; @suluk/hono's enforceRateLimit middleware ENFORCES it on the wire. Advisory vendor extension.
   */
  rateLimit?: SulukRateLimit;
  /**
   * The route's ECONOMICS (the `x-suluk-cost` facet, C024/C044) — declared INLINE with the route so a backend dev
   * pragmatically considers it while writing the code: the per-call floor + the DYNAMIC/metered `components` (per-token,
   * per-mb, per-second, per-request — file size, AI tokens/model, compute), how it's SETTLED (credit/rate-limited/free),
   * when its cost ACCRUES (a non-sync `trigger`/`triggerRef` + `attribution`). emitV4 stamps it onto the operation;
   * @suluk/scalar renders it (badges + the cost/settlement/triggers detail), @suluk/cost audits + records it. Advisory.
   */
  cost?: CostModel;
  /**
   * Mark this op INTERNAL (ops/admin surface — e.g. a raw email-send). It is DOCUMENTED (grouped under "Internal" in the
   * docs, stamped `x-suluk-internal`) but NOT reachable over the wire: the contract's `enforceInternal` guard 404s it in dev
   * AND live, so it can't be accidentally hosted. Invoke it in tests via {@link internalFetch} — a clean in-process path
   * keyed on a per-process nonce that never enters the document or the wire.
   */
  internal?: boolean;
  request?: RouteRequest;
  /** Responses, as a list (each carries its own status) or a status-keyed map. */
  responses?: RouteResponse[] | Record<string, RouteResponse>;
  /** Optional live handler, used only by mount(). */
  handler?: (c: unknown) => unknown | Promise<unknown>;
}

/** Identity helper that preserves literal inference when authoring a contract array. */
export function contract<const T extends readonly RouteContract[]>(routes: T): T {
  return routes;
}

/**
 * A route that satisfies documentation coverage at the TYPE level: it MUST carry a `summary` or a `description`. Used by
 * {@link contractDoc} so a route authored with neither fails to type-check.
 */
export type DocumentedRoute = RouteContract & ({ summary: string } | { description: string });

/**
 * Stricter, OPT-IN variant of {@link contract}: identical runtime behavior + literal inference, but every route must be
 * DOCUMENTED (a `summary` or `description`) or it fails to type-check at the contract site — lifting the doc-coverage
 * audit (`audit()`'s `missing-doc` finding) into the type system, so an undocumented operation is a red squiggle, not a
 * CI warning. `contract()` stays UNCHANGED (some callers author docs separately / exercise the advisory audit); adopt
 * `contractDoc` where you want documentation enforced as you type.
 */
export function contractDoc<const T extends readonly DocumentedRoute[]>(routes: T): T {
  return contract(routes);
}

/** Normalize responses (list or map) to a list. */
export function responseList(r: RouteContract["responses"]): RouteResponse[] {
  if (!r) return [];
  return Array.isArray(r) ? r : Object.values(r);
}
