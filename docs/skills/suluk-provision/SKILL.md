---
description: "Declarative service provisioning for a Suluk app, modelled on the Open Service Broker API and driven like drizzle-kit. Declare the infra you want in one provision.config (D1/KV/R2/secrets/Stripe/domains/tokens as OSB brokers); `plan` diffs desired-vs-live, `apply` walks the binding DAG (provision → poll async last-operation → bind → land credentials in @suluk/env, encrypted + commit-safe), `check` flags drift/orphans. A layer ABOVE @suluk/cloudflare / @suluk/deploy / @suluk/env — it orchestrates, they execute. CANDIDATE tooling."
name: suluk-provision
---

# @suluk/provision

Declarative service provisioning for a Suluk app, modelled on the Open Service Broker API and driven like drizzle-kit. Declare the infra you want in one provision.config (D1/KV/R2/secrets/Stripe/domains/tokens as OSB brokers); `plan` diffs desired-vs-live, `apply` walks the binding DAG (provision → poll async last-operation → bind → land credentials in @suluk/env, encrypted + commit-safe), `check` flags drift/orphans. A layer ABOVE @suluk/cloudflare / @suluk/deploy / @suluk/env — it orchestrates, they execute. CANDIDATE tooling.

## Quick Start

```ts
import {
  defineProvision, plan, apply, assertNoDrift,
  memoryStore, memorySink,
  cloudflareD1, cloudflareToken,
} from "@suluk/provision";

// Declare the infra. `@db.database_id` wires the token AFTER the D1 database.
const config = defineProvision({
  instances: [
    { ref: "db", service: "cloudflare-d1", name: "app-db", protected: true, bind: { database_id: "CLOUDFLARE_D1_ID" } },
    { ref: "token", service: "cloudflare-token", name: "d1-token",
      params: { scope: "@db.database_id" }, bind: { token: "CLOUDFLARE_D1_TOKEN" } },
  ],
});

// The concrete Cloudflare brokers wrap @suluk/cloudflare's idempotent provisioners.
const brokers = { "cloudflare-d1": cloudflareD1(cf), "cloudflare-token": cloudflareToken(cf) };
const store = memoryStore();  // a JSON file in prod (`fileStore`)
const sink = memorySink();    // the @suluk/env manifest in prod (`envSink`)

// Review, then execute along the binding DAG.
const state = await store.load();
console.table(plan(config, state).steps); // [{ ref, action, reason }, …]

const result = await apply(config, { brokers, store, sink });
result.outputsByRef.db; // { database_id: "…" } — resolved outputs after the run

// CI gate: throw if the live infra has drifted from the config.
await assertNoDrift(config, await store.load());
```

## Configuration

6 configuration interfaces — see references/config.md for details.

## Quick Reference

71 exports (36 functions, 33 types, 2 constants) — see references/ for full API.

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)