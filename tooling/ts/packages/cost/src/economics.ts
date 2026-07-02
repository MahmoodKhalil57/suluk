/**
 * THE COST CALCULATOR — the strong metric: what did each USER actually cost us, in tokens (µ$ = dollars 1:1)? Aggregate a
 * user's cost events (what they consumed), net out what they PAID IN (credits bought / subscription), and surface the
 * RATE-LIMIT budget they spent (a non-$ "payment" for rate-limited routes). Positive `netMicroUsd` = they cost more than
 * they paid — a loss, or a deliberate lead/trust investment. Because it's derived from the SAME token unit everything is
 * priced in, you can refactor payment methods just by changing costs and re-running it.
 *
 * `simulateUser` is the "spin up a test user and see what they accrue" harness: declare the routes/events the user hits +
 * their cost models, weigh the static infra against the live pricing, meter the dynamic usage, and read the economics — no
 * server, no real requests. Pure functions of the declarations × the weights.
 */
import type { CostEvent, CostModel, UsageReport } from "./types";
import { principalCost } from "./ledger";
import { computeCost } from "./contract";
import { weighCost, type WeightTable } from "./weigh";

/** Named third-party providers whose meters attribute to THEM in the cost trace; every other meter is Cloudflare infra. */
const PROVIDER_PREFIXES = new Set(["stripe", "resend", "google", "openai", "anthropic", "twilio"]);
/** Which source a weighed meter belongs to — `stripe.charge` → "stripe", `resend.email` → "resend", all CF meters → "cloudflare". */
const meterProvider = (meter: string): string => {
  const prefix = meter.split(".")[0];
  return PROVIDER_PREFIXES.has(prefix) ? prefix : "cloudflare";
};

export interface UserEconomics {
  principal: string;
  /** tokens (µ$) this user COST us — the sum of their cost events. */
  costMicroUsd: number;
  /** tokens (µ$) they PAID IN (credits purchased, subscription value), if tracked. */
  paidMicroUsd: number;
  /** the NET (µ$): cost − paid. Positive = a loss / lead / trust investment; negative = a margin. */
  netMicroUsd: number;
  /** rate-limit budget the user consumed — a SEPARATE, non-$ "currency" (the payment for rate-limited routes), if tracked. */
  ratelimitUsed: number;
  /** number of cost events. */
  events: number;
  /** the cost trace. */
  byOperation: Record<string, number>;
  bySource: Record<string, number>;
}

/** Net economics for ONE user: what they cost, minus what they paid, plus the rate-limit budget they spent. */
export function userEconomics(events: CostEvent[], principal: string, opts: { paidMicroUsd?: number; ratelimitUsed?: number } = {}): UserEconomics {
  const s = principalCost(events, principal);
  const paidMicroUsd = opts.paidMicroUsd ?? 0;
  return {
    principal,
    costMicroUsd: s.total,
    paidMicroUsd,
    netMicroUsd: s.total - paidMicroUsd,
    ratelimitUsed: opts.ratelimitUsed ?? 0,
    events: s.count,
    byOperation: s.byOperation,
    bySource: s.bySource,
  };
}

/** One thing a simulated user does: hit an operation `times` times, with a declared `cost` model + optional dynamic `usage`. */
export interface SimStep {
  operation: string;
  cost?: CostModel;
  /** how many times the user does this (default 1). */
  times?: number;
  /** dynamic usage for the metered components on this hit (e.g. `[{ source: "openai", units: 1350 }]`). */
  usage?: UsageReport[];
  /** the frontend action that triggered it, if any. */
  action?: string;
  paidMicroUsd?: number;
  ratelimitUsed?: number;
}

/**
 * Spin up a TEST USER and see what they accrue — the cost calculator's headline use. For each step: STATIC cost = the
 * infra usage weighed against the live pricing; DYNAMIC cost = the metered components against the declared `usage`; the sum
 * is one cost event × `times`. Returns the events + the net {@link UserEconomics}. `at` is passed in (never read ambiently)
 * so a run is reproducible/testable.
 */
export function simulateUser(principal: string, steps: SimStep[], weights: WeightTable, at = 0): { events: CostEvent[]; economics: UserEconomics } {
  const events: CostEvent[] = [];
  let paidMicroUsd = 0;
  let ratelimitUsed = 0;
  for (const step of steps) {
    const times = step.times ?? 1;
    paidMicroUsd += (step.paidMicroUsd ?? 0) * times;
    ratelimitUsed += (step.ratelimitUsed ?? 0) * times;
    const dyn = computeCost(step.cost, step.usage ?? []); // fixed per-call + metered components
    // fractional µ$ — infra costs are sub-token (0.301 µ$/read); rounding per event would vanish them, so keep them exact.
    const weighed = weighCost(step.cost, weights); // static infra, weighed
    const breakdown = [...dyn.breakdown];
    // attribute each weighed meter to its PROVIDER (stripe/resend/google/… vs cloudflare), summed per source within the event.
    const infraBySource = new Map<string, number>();
    for (const b of weighed.infraBreakdown) if (b.microUsd > 0) infraBySource.set(meterProvider(b.meter), (infraBySource.get(meterProvider(b.meter)) ?? 0) + b.microUsd);
    for (const [source, microUsd] of infraBySource) breakdown.push({ source, microUsd });
    const totalMicroUsd = dyn.totalMicroUsd + weighed.infraMicroUsd;
    for (let i = 0; i < times; i++) events.push({ at, principal, operation: step.operation, action: step.action, breakdown, totalMicroUsd });
  }
  return { events, economics: userEconomics(events, principal, { paidMicroUsd, ratelimitUsed }) };
}
