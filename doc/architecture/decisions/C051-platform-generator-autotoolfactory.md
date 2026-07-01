# C51. OSB-manifest platform generator + `autotoolfactory` — one document → a whole Hono backend

> **Provenance:** Candidate-fork ADR (Suluk), not a SIG decision. Operator-surfaced: *"a separate package that lets a user
> write an OSB API contract that provisions the entire Hono backend by adding the shadcn registry components we create.
> Leave toolfactory alone; create a new `~/apps/autotoolfactory` where we generate a platform with full parity (minus
> `api/transcribe` + `api/subtitle/convert`) with toolfactory from a single OSB document."* Operator chose a **new
> higher-level manifest** + **architecture-only**. Sits ATOP [C050](C050-registry-distributed-framework.md) (the registry)
> and [C047](C047-provision-osb-broker.md) (provision); **supersedes [C049](C049-toolfactory-adoption-roadmap.md)**.

Date: 2026-07-01

## Status

Accepted as an **ARCHITECTURE** (plan only). Ceiling **0.45** (further out; depends on the still-unbuilt C050 registry).
Ledger: [`0platform-generator.bn`](../../../plan/facts/0platform-generator.bn) (burhan True). **Not a contract-facet change.**

## Context — the apex of C047 + C050

C047 gave a declarative `provision.config` (instances → brokers → infra). C050 gave a registry (each module = owned code +
npm logic). This ADR **fuses them under one author-facing document**: a **platform manifest** where each declared service
maps to a module that carries *both* a shadcn registry component (code) *and* a provision fragment (infra). Writing that
one document + running the generator materializes a complete backend. `autotoolfactory` is the proof: a fresh repo
generated from a single manifest, at **full parity with toolfactory minus its product routes** (whisper/subtitle/convert).

**"Leave toolfactory alone" retires the dangerous path.** [C049](C049-toolfactory-adoption-roadmap.md) proposed migrating
toolfactory's LIVE credits/billing/keys onto the packages in place — a money-cutover in a running app. C051 instead
authors the registry components **fresh** and **generates a clean app**, using **toolfactory as the parity ORACLE** (diff
target), not a migration subject. The money modules get proven in a fresh generated app — strictly safer than a live
cutover. C049 is superseded.

## Decision

### 1. The platform manifest (the author surface — a new, higher-level schema)
```ts
// platform.config.ts  →  definePlatform(...)
export default definePlatform({
  name: "autotoolfactory",
  infra: { target: "cloudflare" },              // the OSB provision target
  services: {
    auth:     { providers: ["passkey", "apikey", "mcp-oauth"] },
    keys:     {},
    credits:  { rateCredit: true },
    billing:  { processor: "stripe", autoTopup: true },
    cost: {}, logs: {}, stores: {}, erasure: {}, journeys: {}, audit: {},
  },
})
```
It **compiles down** to two IRs: (a) a C047 `provision.config` (the merged `InstanceSpec[]` from each service's provision
fragment) and (b) the ordered **shadcn add list** (each service's registry component). The manifest is the ergonomic
surface; `provision.config` stays the compiled intermediate — so nothing in C047 changes.

### 2. The catalog (the one genuinely new artifact — the OSB "offerings")
Each service id resolves to a catalog entry bundling code + infra + deps:
```ts
{
  id: "credits",
  component: "suluk/registry/credits",             // the shadcn ref (C050)
  requires: ["auth"],                              // module deps → topo order
  npm: ["@suluk/credits", "@suluk/drizzle"],       // the hybrid logic dep
  provision: (opts) => InstanceSpec[],             // the provision fragment (parametrized)
  env: [...],
}
```

### 3. The generator package (thin over C047 `apply` + shadcn)
Reads the manifest → topo-resolves services against the catalog → for each: `shadcn add <component>` (writes owned code)
+ collect `provision(opts)` → `InstanceSpec[]`. Merge the fragments → a `provision.config` → `@suluk/provision`
`generate`/`migrate`/`apply` (real D1/KV/connector). The novel step over C047 is only the per-service **code
materialization**; everything infra is C047. (Name open — e.g. `@suluk/platform`.)

### 4. `~/apps/autotoolfactory`
A new repo, OUTSIDE this one, that is the generator's OUTPUT: `platform.config.ts` + the generated modules + the
provisioned infra = a Hono backend at toolfactory parity minus the product. Parity is **measured** by diffing its surface
(routes, schema, journeys pass) against toolfactory.

## Consequences / honesty

- **Hard dependency chain: C050 registry components → C051 generator → autotoolfactory.** The generator can only add
  components that exist, so nothing here builds until at least one C050 component is real. First build = a **vertical
  slice**: one service in the manifest → generate → one component + its provision fragment → a running, provisioned
  stub. Prove the pipeline before scaling to ~10 modules.
- **The new code is small; the extraction is the work.** The generator ≈ C047 `apply` + a shadcn step; the manifest→IR
  compiler is a resolver over the catalog. The bulk of effort is authoring the ~10 registry components (C050) faithfully
  against toolfactory's patterns.
- **Money modules proven fresh, not live.** Because autotoolfactory is a clean generated app, the `credits`/`keys`/
  `billing`/`payments` modules are exercised (journeys + parity-diff) without touching a live money path — the win over
  C049.
- **Open:** the generator's name, the manifest file format (`.ts` `definePlatform` vs YAML), the catalog's home (in the
  generator pkg vs the registry repo), and whether `autotoolfactory` is generated-and-committed or generated-on-demand.
- **Backend-first.** The web/UI (toolfactory `web/`) parity is a Phase 2, and the shadcn sweet spot.
