/**
 * COST-COVERAGE audit — a harden dimension that incentivises the strong metric: can the system track what each USER costs?
 * It does that ONLY if every operation declares its economics. So this grades, per operation:
 *   • `cost-undeclared` — the op has NO `x-suluk-cost`. Even a free/cheap route should declare it (its infra usage, or an
 *     explicit `{ settlement: { method: "free" } }`), so its tokens flow into the per-user cost calculator. MEDIUM.
 *   • `cost-without-payment` — the op is PRICED (a positive cost / declared infra) but names NO PAYMENT METHOD
 *     (`settlement`). How is the cost recovered — credit / rate-limited / free / subscription / trust / lead? HIGH.
 *
 * Kept SEPARATE from the security + readiness grades (a score never mixes dimensions); the caller folds its letter into
 * `combineGrades` alongside them. Reads the `x-suluk-cost` facet straight off the doc — no @suluk/cost dependency (the same
 * harden-stays-thin seam readiness uses). Even when a user won't pay directly, cost coverage = per-user cost observability,
 * which is why harden pushes for it.
 */
import type { OpenAPIv4Document, Request } from "@suluk/core";
import { grade, type Finding, type Grade } from "./audit";

export interface CostCoverageAudit {
  findings: Finding[];
  /** operations examined. */
  nodes: number;
  /** operations that declare cost (+ a payment method when priced). */
  clean: number;
  score: number;
  grade: Grade;
}

export interface CostCoverageOptions {
  /** skip operations (e.g. public health/discovery, third-party ingested surfaces) — they don't count. */
  ignore?: (uri: string, name: string) => boolean;
}

interface CostFacet {
  estimateMicroUsd?: number;
  components?: { microUsd?: number }[];
  infra?: Record<string, number>;
  settlement?: { method?: string };
}

/** A cost is PRICED when it declares a positive amount OR any infrastructure usage (which weighs to a positive cost). */
const isPriced = (c: CostFacet | undefined): boolean =>
  !!c && (((c.estimateMicroUsd ?? 0) > 0) || (c.components ?? []).some((x) => (x.microUsd ?? 0) > 0) || Object.keys(c.infra ?? {}).length > 0);

/** Grade the document on COST + PAYMENT-METHOD coverage → findings + a letter (fold into `combineGrades`). */
export function auditCost(doc: OpenAPIv4Document, opts: CostCoverageOptions = {}): CostCoverageAudit {
  const findings: Finding[] = [];
  let nodes = 0;
  let clean = 0;
  for (const [uri, piRaw] of Object.entries(doc.paths ?? {})) {
    const requests = (piRaw as { requests?: Record<string, Request> }).requests ?? {};
    for (const [name, req] of Object.entries(requests)) {
      if (opts.ignore?.(uri, name)) continue;
      nodes++;
      const cost = (req as Request & Record<string, unknown>)["x-suluk-cost"] as CostFacet | undefined;
      if (!cost) {
        findings.push({
          rule: "cost-undeclared",
          severity: "medium",
          path: name,
          message: `operation '${name}' declares no cost — the system can't track what it costs per user`,
          fix: "add x-suluk-cost: declare its infra usage (e.g. { infra: { 'd1.read': 1 } }), or { settlement: { method: 'free' } } for a truly-free op",
        });
        continue;
      }
      if (isPriced(cost) && !cost.settlement?.method) {
        findings.push({
          rule: "cost-without-payment",
          severity: "high",
          path: name,
          message: `priced operation '${name}' names no payment method — how is its cost recovered?`,
          fix: "add x-suluk-cost.settlement: { method: 'credit' | 'rate-limited' | 'free' | 'subscription' | 'trust' | 'lead' }",
        });
        continue;
      }
      clean++;
    }
  }
  const score = nodes === 0 ? 100 : Math.round((clean / nodes) * 100);
  return { findings, nodes, clean, score, grade: grade(score) };
}
