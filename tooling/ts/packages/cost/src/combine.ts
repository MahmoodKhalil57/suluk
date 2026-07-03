/**
 * COMBINING declared cost models — the {@link CostModel} MONOID that lets a route's cost BUBBLE UP from the costs of the
 * service-actions it composes. `@suluk/effect`'s recursive route tree (seq/all/branch) sums the leaf costs with {@link sumCost}
 * so a route that touches N operations declares the SUM of their infra, not a hand-guessed single number.
 *
 * This operates on DECLARED (symbolic) models — `infra` meter-maps + `components` — NOT on weighed µ$. So it composes BEFORE
 * `weighCost`/`resolveCost` (which run ONCE at the top on the merged model): there is no double-counting, because infra is
 * only folded into a µ$ estimate after the whole tree has been summed. The laws:
 *   • infra      — ADD key-wise (`{d1.read:1} ⊕ {d1.read:1,d1.write:1} = {d1.read:2,d1.write:1}`). The core "costs add up".
 *   • components — CONCAT (each is a distinct cost line; two sub-ops each metering OpenAI tokens both count).
 *   • estimate   — ADD.
 *   • settlement — the STRONGEST recovery method wins (`credit` ≻ `subscription` ≻ `trust` ≻ `rate-limited` ≻ `lead` ≻ `free`):
 *                  if ANY sub-op costs real money, the composite does. `credits` SUM; `overflow` prefers `credit`.
 *   • trigger / attribution / reconciliation / amount* / idempotencyKey — AGREE-or-throw: these describe WHEN a *background*
 *                  cost fires and WHO pays; they have no additive join, so composing two operations that DISAGREE on them is a
 *                  build-time error (fail loud), never a silent pick.
 *
 * `⊕` is associative + commutative with identity {@link emptyCost}, so `sumCost` is order-independent — the same tree yields the
 * same cost however you nest it.
 */
import type { CostModel, CostSettlement, SettlementMethod, CostAttribution } from "./types";

/** The identity of the cost monoid — no infra, no components, no settlement. `combineCost(emptyCost, x)` ≡ `x`. */
export const emptyCost: CostModel = { components: [] };

/** Recovery-method strength, most-binding first — `combineSettlement` keeps the MAX so a composite is never weaker (cheaper to
 *  the operator) than its costliest part. `free` is the identity (rank 0). */
const SETTLEMENT_RANK: Record<SettlementMethod, number> = {
  free: 0,
  lead: 1,
  "rate-limited": 2,
  trust: 3,
  subscription: 4,
  credit: 5,
};

/** ADD two infra meter-maps key-wise, dropping non-finite/undefined units (the `CostModel.infra` type tolerates `undefined`). */
function combineInfra(
  a: Record<string, number | undefined> | undefined,
  b: Record<string, number | undefined> | undefined,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const src of [a, b]) {
    if (!src) continue;
    for (const [meter, units] of Object.entries(src)) {
      if (typeof units !== "number" || !Number.isFinite(units)) continue;
      out[meter] = (out[meter] ?? 0) + units;
    }
  }
  return out;
}

/** The STRONGEST settlement wins; `credits` sum; `overflow` prefers charging (`credit`) over refusing (`deny`). */
function combineSettlement(a: CostSettlement | undefined, b: CostSettlement | undefined): CostSettlement | undefined {
  if (!a) return b;
  if (!b) return a;
  const method: SettlementMethod = SETTLEMENT_RANK[a.method] >= SETTLEMENT_RANK[b.method] ? a.method : b.method;
  const out: CostSettlement = { method };
  const credits = (a.credits ?? 0) + (b.credits ?? 0);
  if (credits > 0) out.credits = credits;
  const overflow = a.overflow === "credit" || b.overflow === "credit" ? "credit" : a.overflow ?? b.overflow;
  if (overflow) out.overflow = overflow;
  return out;
}

/** AGREE-or-throw: two values that both matter but have no additive join. Undefined tolerates the other; a genuine conflict
 *  fails LOUD (the composed operations disagree on a background-cost fact that cannot be silently reconciled). */
function agree<T>(field: string, a: T | undefined, b: T | undefined): T | undefined {
  if (a === undefined) return b;
  if (b === undefined) return a;
  if (JSON.stringify(a) === JSON.stringify(b)) return a;
  throw new Error(`combineCost: composed operations disagree on "${field}" (${JSON.stringify(a)} vs ${JSON.stringify(b)}) — it has no additive join; declare it once on the route.`);
}

/**
 * Combine two DECLARED cost models — the monoid's `⊕`. Associative, commutative, identity {@link emptyCost}. Used by
 * {@link sumCost} to fold a recursive route tree's leaf costs into ONE route cost that then weighs/audits like any other.
 */
export function combineCost(a: CostModel, b: CostModel): CostModel {
  const out: CostModel = { components: [...(a.components ?? []), ...(b.components ?? [])] };

  const infra = combineInfra(a.infra, b.infra);
  if (Object.keys(infra).length > 0) out.infra = infra;

  if (a.estimateMicroUsd !== undefined || b.estimateMicroUsd !== undefined) {
    out.estimateMicroUsd = (a.estimateMicroUsd ?? 0) + (b.estimateMicroUsd ?? 0);
  }

  const settlement = combineSettlement(a.settlement, b.settlement);
  if (settlement) out.settlement = settlement;

  // trigger / triggerRef / attribution / reconciliation / amount* / idempotencyKey describe a BACKGROUND cost (WHEN it fires,
  // WHO pays) — no additive join, so an absent value defers to the other and two DIFFERENT declared values fail loud.
  const trigger = agree("trigger", a.trigger, b.trigger);
  if (trigger) out.trigger = trigger;

  const triggerRef = agree("triggerRef", a.triggerRef, b.triggerRef);
  if (triggerRef) out.triggerRef = triggerRef;

  const attribution = agree<CostAttribution>("attribution", a.attribution, b.attribution);
  if (attribution) out.attribution = attribution;

  const reconciliationBasis = agree("reconciliationBasis", a.reconciliationBasis, b.reconciliationBasis);
  if (reconciliationBasis) out.reconciliationBasis = reconciliationBasis;

  const amountExpression = agree("amountExpression", a.amountExpression, b.amountExpression);
  if (amountExpression) out.amountExpression = amountExpression;

  const amountUnit = agree("amountUnit", a.amountUnit, b.amountUnit);
  if (amountUnit) out.amountUnit = amountUnit;

  const idempotencyKey = agree("idempotencyKey", a.idempotencyKey, b.idempotencyKey);
  if (idempotencyKey) out.idempotencyKey = idempotencyKey;

  return out;
}

/** Fold a list of declared cost models into one via {@link combineCost} — the entry point the route tree uses. Order-independent
 *  (the monoid is commutative). `sumCost([])` is {@link emptyCost}. */
export function sumCost(models: readonly (CostModel | undefined)[]): CostModel {
  return models.reduce<CostModel>((acc, m) => (m ? combineCost(acc, m) : acc), emptyCost);
}
