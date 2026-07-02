/**
 * INFRA COST WEIGHTS — the base of the token economy. Cloudflare's public developer-platform pricing (harvested +
 * adversarially re-verified in `cloudflare_pricing_pragmatic.json`) becomes a flat table of **tokens per infra unit**,
 * where **1 token = 1 micro-USD (µ$)** — so tokens map 1:1 to dollars ($1 = 1_000_000 tokens). A route/event declares the
 * infra UNITS it consumes (2 D1 rows read, 1 KV write, 3 CPU-ms, …); `weighInfra` turns that into tokens. The weight is
 * `overage_usd / overage_per × 1e6` — the marginal µ$ of one more unit (the honest per-request cost; the plan base is a
 * fixed monthly cost, not a per-request one). This is the STATIC (infra-only) cost floor; a component may add DYNAMIC cost
 * on top (per-token / per-mb / a third-party charge). @suluk/cost consumes this; @suluk/deploy + @suluk/platform bubble it up.
 *
 * NOT a billing oracle — CF prices change + regional/enterprise terms vary. This is a fair, reconcilable estimate base.
 */
import raw from "../cloudflare_pricing_pragmatic.json";

/** 1 token = 1 micro-USD. The whole system prices in tokens; they convert to dollars 1:1 at this scale. */
export const MICRO_PER_USD = 1_000_000;

export interface PricingMeter {
  key: string;
  unit?: string;
  /** dollars per `overage_per` units, above the plan's included allotment. */
  overage_usd?: number;
  /** the unit granularity `overage_usd` is quoted per (e.g. 1_000_000 rows). Default 1. */
  overage_per?: number;
  free_included?: number;
  paid_included?: number;
  [k: string]: unknown;
}
export interface PricingProduct {
  id: string;
  category?: string;
  confidence?: string;
  meters?: PricingMeter[];
  [k: string]: unknown;
}
export interface PricingDoc {
  meta: Record<string, unknown>;
  products: PricingProduct[];
}

/** The normalized Cloudflare pricing (24 products, 75 metered units), harvested 2026-07-02. */
export const CLOUDFLARE_PRICING = raw as unknown as PricingDoc;

/** A `<product>.<meter>` key (e.g. `"workers.requests"`, `"durable-objects.rows_read"`). */
export type InfraMeter = string;

/**
 * The infra-weight table: `<product>.<meter>` → **tokens (µ$) per ONE unit** (the marginal cost of one more unit). Built
 * from the pricing's `overage_usd / overage_per`. Pass a custom `pricing` to weigh against a different snapshot.
 */
export function infraWeights(pricing: PricingDoc = CLOUDFLARE_PRICING): Record<InfraMeter, number> {
  const w: Record<string, number> = {};
  for (const p of pricing.products ?? []) {
    for (const m of p.meters ?? []) {
      if (m.overage_usd == null) continue;
      w[`${p.id}.${m.key}`] = (m.overage_usd / (m.overage_per ?? 1)) * MICRO_PER_USD;
    }
  }
  return w;
}

/**
 * Friendly aliases → canonical `<product>.<meter>` keys, so a route can declare `{ "d1.read": 2, "kv.write": 1 }` without
 * knowing that D1/KV storage is metered under the `durable-objects` product line. The canonical keys always work too.
 */
export const INFRA_ALIASES: Record<string, InfraMeter> = {
  "worker.request": "workers.requests",
  "worker.cpu_ms": "workers.cpu_time",
  "d1.read": "durable-objects.rows_read",
  "d1.write": "durable-objects.rows_written",
  "d1.storage_gb_month": "durable-objects.sqlite_storage",
  "kv.read": "durable-objects.kv_read_request_units",
  "kv.write": "durable-objects.kv_write_request_units",
  "kv.delete": "durable-objects.kv_delete_requests",
  "kv.storage_gb_month": "durable-objects.kv_storage",
  "queue.operation": "queues.operations",
  "r2.class_a": "r2.class_a_operations",
  "r2.class_b": "r2.class_b_operations",
  "r2.storage_gb_month": "r2.storage",
};

/**
 * {@link infraWeights} PLUS an entry for every {@link INFRA_ALIASES} alias (alias → its canonical weight), so a consumer can
 * weigh a usage map keyed by EITHER the friendly alias or the canonical `<product>.<meter>`. This is the table
 * `@suluk/cost`'s `weighCost` is fed — the merge point where provider weights (Stripe/Resend/…) are added on top.
 */
export function weightTable(pricing: PricingDoc = CLOUDFLARE_PRICING): Record<InfraMeter, number> {
  const w = infraWeights(pricing);
  for (const [alias, canonical] of Object.entries(INFRA_ALIASES)) if (w[canonical] != null) w[alias] = w[canonical];
  return w;
}

export interface WeighResult {
  /** total tokens (µ$) for the declared usage. */
  microUsd: number;
  /** per-meter breakdown (tokens). */
  breakdown: { meter: InfraMeter; units: number; microUsd: number }[];
  /** meters we have no weight for — surfaced, never silently zeroed. */
  unknown: string[];
}

/**
 * Weigh a declared infra USAGE map → tokens (µ$). `usage` keys are canonical `<product>.<meter>` or an {@link INFRA_ALIASES}
 * alias; values are the unit counts. Unknown meters are reported (not silently dropped). This is how the STATIC infra cost
 * of a route/event is computed from the weights — the raw floor before any dynamic (per-token / third-party) cost.
 */
export function weighInfra(usage: Record<string, number>, weights: Record<InfraMeter, number> = infraWeights()): WeighResult {
  let microUsd = 0;
  const breakdown: WeighResult["breakdown"] = [];
  const unknown: string[] = [];
  for (const [rawKey, units] of Object.entries(usage)) {
    const meter = INFRA_ALIASES[rawKey] ?? rawKey;
    const w = weights[meter];
    if (w == null) { unknown.push(rawKey); continue; }
    const cost = units * w;
    microUsd += cost;
    breakdown.push({ meter, units, microUsd: cost });
  }
  return { microUsd, breakdown, unknown };
}
