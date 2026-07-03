/**
 * `@suluk/cost` — cost as a contract facet + runtime metering. You can't price a user without knowing what
 * they cost you. So: declare per-operation cost (incl. third-party usage) on the contract — it bubbles into
 * the v4 doc, Scalar, and the audit; meter the ACTUAL cost per request at runtime, traced from the frontend
 * action down to each third party; and read the raw per-user picture from the ledger. We display the data as
 * it is and let you build pricing on top (Stripe via @suluk/stripe). CANDIDATE tooling — NOT official OAS.
 */
export {
  type CostBasis, type CostComponent, type CostModel, type UsageReport, type CostEvent, formatMicroUsd,
  // C024 — background-event cost: WHEN it fires (trigger) + WHO pays (attribution), orthogonal to basis (HOW it meters).
  type CostTrigger, type CostAttribution, UNATTRIBUTED,
  // C026 — reconciliation: declared-estimate vs the third party's actual (payload-reconciled) charge.
  type ReconciliationBasis,
  // C044 — settlement: HOW the cost is recovered (credit | rate-limited | free).
  type SettlementMethod, type CostSettlement,
} from "./types";
// C044 — settlement audit (every priced op names a lever) + the errors a request's facets imply.
export {
  settlementOf, settlementAudit, impliedErrorStatuses, settlementRollup,
  type SettlementFinding, type SettlementSeverity, type SettlementRollup,
} from "./settlement";
export {
  COST_EXT, annotateCosts, costOf, costAudit, costTable, computeCost, type CostFinding,
  eachOperation, eachJob, triggerOf, isDeferredCost, type CostRow,
} from "./contract";
export {
  costMeter, recordUsage, MemoryCostSink, type CostSink, type CostMeterOptions,
} from "./meter";
// C024 — the Context-free background-event cost path (a fired webhook/cron/queue event, no live caller).
export {
  resolveEventExpression, attributePrincipal, eventCostEvent, recordEventCost, reconciledAmount, type EventCostInput,
} from "./event";
export { summarize, principalCost, type CostSummary } from "./ledger";
// weigh a declared cost model to TOKENS (µ$) via the live infra/provider weight table (from @suluk/cloudflare weightTable()).
export { weighCost, resolveCost, mergeWeights, type WeightTable, type WeighedCost } from "./weigh";
// COMBINE declared cost models — the CostModel MONOID (infra add, components concat, settlement strongest-wins). Lets a route's
// cost BUBBLE UP from the service-actions it composes (@suluk/effect's recursive route tree sums leaf costs via sumCost).
export { combineCost, sumCost, emptyCost } from "./combine";
// THE COST CALCULATOR — net per-user economics (cost − paid, + rate-limit budget) + the "spin up a test user" simulator.
export { userEconomics, simulateUser, type UserEconomics, type SimStep } from "./economics";
// RATE-LIMIT EXPOSURE — rate-limit caps × per-route cost = the per-user $ budget; × N users = the platform's money-on-the-line.
export { rateLimitExposure, exposureAtUsers, DEFAULT_EXPOSURE_PERIOD_MS, type PlatformExposure, type RouteExposure, type RateLimitFacet } from "./exposure";
