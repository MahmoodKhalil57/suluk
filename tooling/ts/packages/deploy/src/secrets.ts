/**
 * Contract-DERIVED durable bindings. The infra a Suluk app needs falls out of the contract's advisory facets — a
 * rate-limit budget needs a counter store, a declared cost needs a sink, a bound storage provider needs an R2 bucket.
 * PURE: it returns the binding LIST; the caller (the generated `scripts/deploy.ts`) feeds it into the `@suluk/cloudflare`
 * deploy, which PROVISIONS each binding over the REST API (no `wrangler kv namespace create`, no ambient auth).
 * (Secrets are pushed by the deploy itself via `@suluk/cloudflare`'s `putSecrets` from the decrypted `.env` — there is
 * no longer a `wrangler secret put` step plan.)
 */
import { rateLimitCoverage } from "@suluk/core";
import type { OpenAPIv4Document } from "@suluk/core";

export interface DurableBinding {
  kind: "kv" | "do" | "r2" | "queue";
  /** the binding name the Worker code reads (e.g. RATE_LIMIT). */
  binding: string;
  /** the resource name to create. */
  resource: string;
  /** why the contract needs it. */
  reason: string;
}

export interface BindingPlan {
  bindings: DurableBinding[];
  notes: string[];
}

/** Does any operation declare an x-suluk-cost facet? (the cost sink trigger). */
function hasCostFacet(doc: OpenAPIv4Document): boolean {
  for (const pi of Object.values(doc.paths ?? {})) {
    const requests = (pi as unknown as { requests?: Record<string, Record<string, unknown>> }).requests ?? {};
    for (const op of Object.values(requests)) if (op["x-suluk-cost"]) return true;
  }
  return false;
}

/**
 * The durable bindings a contract needs, derived from its facets: a rate-limit budget (x-suluk-ratelimit) needs a
 * KV counter store; a declared cost (x-suluk-cost) needs a KV sink; a bound storage provider needs an R2 bucket. The
 * deploy PROVISIONS each over the API — this only says WHICH bindings the contract implies.
 */
export function durableBindings(doc: OpenAPIv4Document, appName = "app"): BindingPlan {
  const bindings: DurableBinding[] = [];
  if (rateLimitCoverage(doc).limited > 0) {
    bindings.push({ kind: "kv", binding: "RATE_LIMIT", resource: `${appName}-ratelimit`, reason: "x-suluk-ratelimit needs a durable counter (the @suluk/hono RateLimitStore default is dev-only)." });
  }
  if (hasCostFacet(doc)) {
    bindings.push({ kind: "kv", binding: "COST_SINK", resource: `${appName}-cost`, reason: "x-suluk-cost needs a durable sink (MemoryCostSink is dev-only)." });
  }
  // a bound `storage` provider slot (x-suluk-providers.storage) needs an R2 bucket (the StorageProvider's backing).
  const providers = (doc as { ["x-suluk-providers"]?: Record<string, string> })["x-suluk-providers"];
  if (providers?.storage) {
    bindings.push({ kind: "r2", binding: "MEDIA", resource: `${appName}-media`, reason: `the ${providers.storage} storage provider needs an R2 bucket (memoryStorage is dev-only).` });
  }
  const notes = bindings.length
    ? ["These bindings are provisioned by the API deploy (@suluk/cloudflare) — no wrangler create steps."]
    : ["No durable bindings required by the contract's facets."];
  return { bindings, notes };
}
