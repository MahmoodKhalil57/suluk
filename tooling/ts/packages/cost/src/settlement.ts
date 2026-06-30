/**
 * Cost SETTLEMENT (C044) — how a declared cost is RECOVERED from the user. The fifth orthogonal cost axis. Promotes a
 * real cowpath: toolfactory's governance gate already checks "every cost names a lever — credit | rate-limit | free";
 * this makes that a first-class, Suluk-derived facet. Also derives the HTTP errors a request's facets IMPLY (the
 * generic form of toolfactory's errors-gate). Pure functions of the declared facets — never a request value.
 */
import type { OpenAPIv4Document, Request } from "@suluk/core";
import { eachOperation, costOf } from "./contract";
import type { CostModel, CostSettlement } from "./types";

const ext = (req: Request) => req as Request & Record<string, unknown>;

/** The settlement declared on an operation's cost. */
export function settlementOf(req: Request): CostSettlement | undefined {
  return costOf(req)?.settlement;
}

const isPriced = (cost: CostModel | undefined): boolean =>
  !!cost && (((cost.estimateMicroUsd ?? 0) > 0) || (cost.components ?? []).some((c) => (c.microUsd ?? 0) > 0));

export type SettlementSeverity = "high" | "medium" | "low";
export interface SettlementFinding {
  rule: string;
  severity: SettlementSeverity;
  operation: string;
  path: string;
  message: string;
  fix: string;
}

/**
 * Audit that every PRICED operation names HOW it is settled, and that the named lever is coherent — the generic form of
 * toolfactory's "cost names a lever" governance check.
 */
export function settlementAudit(doc: OpenAPIv4Document): SettlementFinding[] {
  const findings: SettlementFinding[] = [];
  for (const { path, name, req } of eachOperation(doc)) {
    const cost = costOf(req);
    const s = cost?.settlement;
    const add = (rule: string, severity: SettlementSeverity, message: string, fix: string) => findings.push({ rule, severity, operation: name, path, message, fix });

    if (isPriced(cost) && !s) {
      add("cost-without-settlement", "medium", `priced op '${name}' does not name how its cost is paid`, "add x-suluk-cost.settlement: { method: 'credit' | 'rate-limited' | 'free' }");
    }
    if (s?.method === "rate-limited" && !ext(req)["x-suluk-ratelimit"]) {
      add("rate-limited-without-cap", "high", `op '${name}' is settled by rate-limiting but declares no x-suluk-ratelimit — there is no cap to BE the payment`, "add an x-suluk-ratelimit (the free-tier cap), or change settlement.method");
    }
    if (s?.method === "credit" && s.credits == null && !cost?.estimateMicroUsd) {
      add("credit-without-amount", "medium", `op '${name}' is settled by credit but declares neither settlement.credits nor an estimateMicroUsd to debit`, "set settlement.credits (or x-suluk-cost.estimateMicroUsd) so the runtime knows the debit");
    }
    if (s?.method === "free" && isPriced(cost)) {
      add("free-but-priced", "low", `op '${name}' is settled as free yet declares a positive cost — the operator absorbs it`, "confirm intended, or change settlement.method to credit / rate-limited");
    }
  }
  return findings;
}

/**
 * The HTTP error statuses a request's FACETS imply (the generic form of toolfactory's errors-gate): a contract should
 * declare these responses. credit→402 · authenticated/admin→401 · owner-scope→403 · rate-limit→429 · an upstream
 * third-party call (a `per-request` cost component)→502. A pure function of the declared facets.
 */
export function impliedErrorStatuses(req: Request): number[] {
  const out = new Set<number>();
  const cost = costOf(req);
  const access = ext(req)["x-suluk-access"] as { requires?: string; scope?: string } | undefined;
  if (cost?.settlement?.method === "credit") out.add(402);
  if (access?.requires === "authenticated" || access?.requires === "admin") out.add(401);
  if (access?.scope) out.add(403);
  if (ext(req)["x-suluk-ratelimit"]) out.add(429);
  if ((cost?.components ?? []).some((c) => c.basis === "per-request")) out.add(502);
  return [...out].sort((a, b) => a - b);
}

export interface SettlementRollup {
  credit: number;
  ["rate-limited"]: number;
  free: number;
  /** priced ops with NO settlement declared (the gap). */
  unsettled: number;
}

/** A quick "how is this API monetized" tally — ops grouped by settlement method (+ priced-but-unsettled). */
export function settlementRollup(doc: OpenAPIv4Document): SettlementRollup {
  const r: SettlementRollup = { credit: 0, "rate-limited": 0, free: 0, unsettled: 0 };
  for (const { req } of eachOperation(doc)) {
    const cost = costOf(req);
    const m = cost?.settlement?.method;
    if (m) r[m]++;
    else if (isPriced(cost)) r.unsettled++;
  }
  return r;
}
