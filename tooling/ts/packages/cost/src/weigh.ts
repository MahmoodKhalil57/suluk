/**
 * WEIGHING — resolve a declared {@link CostModel} to TOKENS (µ$) using a live WEIGHT table. The declaration is SYMBOLIC
 * (`model.infra = { meter: units }`); the weights (from @suluk/cloudflare `weightTable()` — CF infra — merged with any
 * provider weights the operator adds on top, e.g. Stripe/Resend/Google) turn it into a number. So a route's STATIC cost is
 * DERIVED from real pricing, not hand-guessed, and re-weighs when pricing changes. The weights are PASSED IN (no
 * @suluk/cloudflare dep here — the app/platform merges + hands them over), keeping the cost facet infra-agnostic.
 *
 * Static vs dynamic: `model.infra` (+ fixed `per-call` components) is the STATIC floor. DYNAMIC cost — per-token, per-mb,
 * a % third-party fee — depends on runtime input/output, so it stays in `components` and is metered per request (computeCost).
 */
import type { CostModel } from "./types";

/** meter key (canonical `<product>.<meter>` or an alias) → tokens (µ$) per one unit. Merge CF + provider weights. */
export type WeightTable = Record<string, number>;

/**
 * Merge weight tables into one — the bubble-up join point. The operator combines @suluk/cloudflare's `weightTable()` (infra)
 * with each provider's fee weights (`STRIPE_WEIGHTS`, `RESEND_WEIGHTS`, `AUTH_WEIGHTS`, …) into the single table `weighCost`
 * reads, so a route's `infra: { "d1.read": 1, "resend.email": 1, "stripe.charge": 1 }` prices from ONE source. Later tables
 * win on a key clash (so an operator override, passed last, takes precedence over a provider default).
 */
export function mergeWeights(...tables: (WeightTable | undefined)[]): WeightTable {
  return Object.assign({}, ...tables.filter(Boolean));
}

export interface WeighedCost {
  /** STATIC tokens per call (µ$): the fixed per-call floor + the infra-weighted usage. Excludes dynamic/metered components. */
  microUsd: number;
  /** the infra portion (µ$) — `model.infra` × weights. */
  infraMicroUsd: number;
  /** the fixed per-call components portion (µ$). */
  fixedMicroUsd: number;
  /** per-meter infra breakdown (µ$). */
  infraBreakdown: { meter: string; units: number; microUsd: number }[];
  /** infra meters with no weight in the table — surfaced, never silently zeroed. */
  unknownMeters: string[];
}

const isFixed = (basis: string | undefined): boolean => (basis ?? "per-call") === "per-call";

/** Resolve a cost model's STATIC token cost from the weight table. Fixed `per-call` components use their declared µ$; the
 *  `infra` usage map is weighed. Unknown meters are reported. Dynamic components (per-token/…) are NOT included here. */
export function weighCost(model: CostModel | undefined, weights: WeightTable): WeighedCost {
  const fixedMicroUsd = (model?.components ?? []).filter((c) => isFixed(c.basis)).reduce((s, c) => s + (c.microUsd ?? 0), 0);
  let infraMicroUsd = 0;
  const infraBreakdown: WeighedCost["infraBreakdown"] = [];
  const unknownMeters: string[] = [];
  for (const [meter, units] of Object.entries(model?.infra ?? {})) {
    const w = weights[meter];
    if (w == null) { unknownMeters.push(meter); continue; }
    const micro = units * w;
    infraMicroUsd += micro;
    infraBreakdown.push({ meter, units, microUsd: micro });
  }
  return { microUsd: fixedMicroUsd + infraMicroUsd, infraMicroUsd, fixedMicroUsd, infraBreakdown, unknownMeters };
}

/** Fold the weighed STATIC cost back onto the model as `estimateMicroUsd` (+ a resolved `compute` component) — so the
 *  DECLARED symbolic `infra` becomes a concrete µ$ estimate the doc/Scalar/harden read, without changing the source. */
export function resolveCost(model: CostModel, weights: WeightTable): CostModel {
  const w = weighCost(model, weights);
  if (!model.infra || w.infraMicroUsd === 0) return model;
  const components = [...model.components, { source: "infrastructure", basis: "per-call" as const, microUsd: Math.round(w.infraMicroUsd), description: "infra + provider fees (weighed from the live weight table)" }];
  return { ...model, components, estimateMicroUsd: (model.estimateMicroUsd ?? 0) + Math.round(w.infraMicroUsd) };
}
