/**
 * RATE-LIMIT EXPOSURE — the "how much money are we putting on the line" calculator. When every route costs something (>0)
 * and is settled by RATE-LIMIT (the platform absorbs the cost, the cap is the protection), the rate-limit itself becomes a
 * DOLLAR BUDGET: a route's `maxRequests` per window × its per-call cost = the most that route can cost ONE user per period.
 * Sum across all routes = the per-user budget (the max a single user can cost you). × N users = the platform's max exposure.
 *
 * This is derived from the SAME token unit everything is priced in (µ$ = $ 1:1) + the SAME weight table, so it re-computes
 * when pricing or a rate-limit changes. It bounds the STATIC per-call cost (infra + fixed components weighed against real
 * pricing); DYNAMIC per-call cost (per-token AI, a % fee) scales with input and is reported separately as unbounded-per-call.
 * A rate-limited route with NO cap is UNBOUNDED exposure — surfaced in `unbounded`, never silently ignored.
 */
import type { OpenAPIv4Document, Request } from "@suluk/core";
import { eachOperation, costOf } from "./contract";
import { weighCost, type WeightTable } from "./weigh";

/** The declared rate-limit cap (the x-suluk-ratelimit facet emitV4 stamps from RouteContract.rateLimit). */
export interface RateLimitFacet {
  windowMs: number;
  maxRequests: number;
  key?: string;
}

const rateLimitOf = (req: Request): RateLimitFacet | undefined =>
  (req as Request & Record<string, unknown>)["x-suluk-ratelimit"] as RateLimitFacet | undefined;

export interface RouteExposure {
  operation: string;
  path: string;
  /** the STATIC per-call cost (µ$): infra + fixed per-call components, weighed against the live pricing. */
  costPerCallMicroUsd: number;
  windowMs: number;
  maxRequests: number;
  /** the rate-limit cap projected to the exposure period. */
  maxCallsPerPeriod: number;
  /** the worst case (µ$) this route can cost ONE user per period: costPerCall × maxCallsPerPeriod. */
  maxMicroUsdPerPeriod: number;
}

export interface PlatformExposure {
  /** the accounting period the budget is expressed over (default 30 days). */
  periodMs: number;
  /** THE RATE-LIMIT BUDGET (µ$): the max a SINGLE user can cost per period if they max every route's rate limit. */
  perUserMicroUsd: number;
  /** per-route breakdown, largest exposure first. */
  routes: RouteExposure[];
  /** priced routes with NO rate-limit cap — UNBOUNDED exposure (a user can hammer them without limit). Fix before hosting. */
  unbounded: { operation: string; path: string; costPerCallMicroUsd: number }[];
}

/** 30 days — the default exposure period ("$ per user per month"). */
export const DEFAULT_EXPOSURE_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Compute the platform's rate-limit exposure from the contract's per-route costs × their rate-limit caps. `perUserMicroUsd`
 * is the per-user budget (max cost per period); pass it to {@link exposureAtUsers} for the total money on the line at N users.
 */
export function rateLimitExposure(doc: OpenAPIv4Document, weights: WeightTable, opts: { periodMs?: number } = {}): PlatformExposure {
  const periodMs = opts.periodMs ?? DEFAULT_EXPOSURE_PERIOD_MS;
  const routes: RouteExposure[] = [];
  const unbounded: PlatformExposure["unbounded"] = [];
  for (const { path, name, req } of eachOperation(doc)) {
    const costPerCallMicroUsd = weighCost(costOf(req), weights).microUsd;
    if (!(costPerCallMicroUsd > 0)) continue; // a zero-cost route puts nothing on the line
    const rl = rateLimitOf(req);
    if (!rl || !(rl.maxRequests > 0) || !(rl.windowMs > 0)) {
      unbounded.push({ operation: name, path, costPerCallMicroUsd });
      continue;
    }
    const maxCallsPerPeriod = rl.maxRequests * (periodMs / rl.windowMs);
    routes.push({
      operation: name,
      path,
      costPerCallMicroUsd,
      windowMs: rl.windowMs,
      maxRequests: rl.maxRequests,
      maxCallsPerPeriod,
      maxMicroUsdPerPeriod: costPerCallMicroUsd * maxCallsPerPeriod,
    });
  }
  routes.sort((a, b) => b.maxMicroUsdPerPeriod - a.maxMicroUsdPerPeriod);
  const perUserMicroUsd = routes.reduce((s, r) => s + r.maxMicroUsdPerPeriod, 0);
  return { periodMs, perUserMicroUsd, routes, unbounded };
}

/** The platform's max exposure (µ$) hosting `users` users for one period — the money on the line if every user maxes out. */
export function exposureAtUsers(exposure: PlatformExposure, users: number): number {
  return exposure.perUserMicroUsd * Math.max(0, users);
}
