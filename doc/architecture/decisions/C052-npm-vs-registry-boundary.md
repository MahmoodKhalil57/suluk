# C52. The npm-package vs shadcn-registry boundary — "own the wiring, npm the logic"

> **Provenance:** Candidate-fork ADR (Suluk), not a SIG decision. Operator-surfaced: *"think what we should add as suluk
> packages and what we should keep in our shadcn registry."* Grounded in a 25-agent multi-lens analysis (classify →
> adversarial-verify → synthesis) over the real ~45-package inventory + the 10 registry modules. Refines the composition
> rule of [C050](C050-registry-distributed-framework.md); governs every future module + package decision.

Date: 2026-07-01

## Status

Accepted as the **BOUNDARY RULE**. Ceiling **0.6** (a design rule, validated by classifying 12 candidates + the adversarial
correction of a wrong "new package" instinct, not yet by building all of them). Ledger:
[`0registry-framework.bn`](../../../plan/facts/0registry-framework.bn) (burhan True). Not a contract-facet change.

## Context — the layer that was already answered

C050 set the 3 layers (npm logic · shadcn registry wiring · provision infra) and the HYBRID rule. This ADR answers the
operator's sharper question — *for each new capability, does it become an npm package or registry code?* — and finds the
**logic layer is already mature**: ~45 `@suluk/*` packages exist, but only **10 registry modules**. So the answer, at this
point in the project, is almost always **"the package already exists; build the registry wiring."**

The 25-agent analysis classified 12 candidate capabilities. The decisive output: **`newPackagesNeeded: []`** — *zero* new
npm packages. Every candidate wires over an existing package or extends an existing module. The adversarial pass also
**caught a wrong instinct**: rate-limiting felt like new token-bucket logic, but `@suluk/hono` already ships
`enforceRateLimit` + `RateLimitStore` + `MemoryRateLimitStore` (and `@suluk/cost` owns the `rate-limited` settlement,
`@suluk/credits` the overflow CAS) — so it is registry wiring, not a package. This is the Adam over-build blindspot, caught
by an independent lens.

## Decision — the rule

> **If a capability introduces a money/security/correctness algorithm that a single bug-fix must flow to EVERY consumer
> for** (atomic CAS, cap/headroom algebra, signature/SSRF verification, status/Problem-Details mapping, deterministic
> contract projection) **it is npm-package logic. And if a `@suluk/*` package already owns it (~45 exist), you almost
> never spawn a new package — you DEP the package and put only the app-owned, per-repo-editable WIRING** (Hono routes, the
> Effect `Context.Tag`/`Layer` binding to `Db`/`env`, the drizzle schema, the provision fragment, and app POLICY like which
> windows/cadence/templates/limits) **into a shadcn registry module. Spawn a new package ONLY when the shared logic is
> genuinely novel AND cannot justify living in any existing package; EXTEND an existing package/module when the gap is a
> declared slot on an interface already built to grow it.**

**Litmus (both directions).** A registry module that *reimplements a package's algorithm* is a fork-in-waiting. A
"fully-owned" module that *hides a shared correctness/security algorithm* is the same bug in reverse. The seam is exact:
the module DEPs the package and never re-derives its logic; the package takes app policy as injected parameters and never
hardcodes a repo's choices.

### Classification (12 candidates, adversarially verified)

| Capability | Verdict | Wires over / extends | Priority |
|---|---|---|---|
| email (transactional: verify, receipts) | registry over package | `@suluk/email` | **high** |
| webhooks (verified inbound payment events) | registry over package | `@suluk/payments` (verify + router) | **high** |
| keys-provision-route (mint capped delegated child key) | **extend** existing module | `@suluk/keys` | **high** |
| rate-limit (credit-backed free-tier) | registry over package | `@suluk/hono` (+ core/cost/credits) | medium |
| mcp (contract-projected MCP server mount) | registry over package | `@suluk/mcp` | medium |
| agents (agent scaffolds + governance) | registry over package | `@suluk/agents` | medium |
| uploads (R2 presigned/direct + store/delete) | **extend** existing | `@suluk/deploy` | medium |
| jobs (cron + queue-consumer wiring) | registry over package | `@suluk/cost` (+ `@suluk/cloudflare`) | medium |
| i18n (locale/dir middleware) | registry over package | `@suluk/i18n` | medium |
| bulk-operations (idempotent batch) | registry over package | `@suluk/drizzle` (+ `@suluk/credits`) | medium |
| validation (zod → RFC-9457 400) | **extend** existing | `@suluk/hono` | medium |
| seo (robots/sitemap/hreflang) | **not a backend module** | `@suluk/seo` (build/client-time) | low |

**New npm packages required: none.**

### Roadmap (next registry modules, value × genericness)

1. **email** — DEP `@suluk/email`, bind `pickProvider` to env + wire Better Auth verify/reset + order-receipt hooks. Blocks real signups today; near-universal.
2. **webhooks** — over `@suluk/payments`: raw-body `POST /webhooks/stripe` → `verifyStripeSignature` → idempotent dispatch (`grantOnce`). Every payment-taking app needs the verified inbound seam.
3. **keys-provision-route** — extend the `keys` module with `POST /keys/provision` (effectiveCaps + clamp-child-grant → Better Auth create → insert lineage). Self-contained, no new package.
4. **rate-limit** — over `@suluk/hono`(+core/cost/credits): principal-aware keyer, per-op window/max policy, durable store binding, overflow → `debitIfCovers`.
5. **i18n** — a Hono port of the existing locale/dir middleware (`c.set(locale/dir)`). Thin, generic.

## Consequences

- **Growth is registry-first.** The framework matures by adding registry modules over the existing packages, not by
  minting packages. Package count should stay roughly flat; module count climbs toward parity.
- **A new package is now an exception that must be argued** (novel shared logic + no existing home) — the default answer to
  "should this be a package?" is *no, it already is one / it's wiring*.
- **`seo` (and any build/client-time capability) is out of scope for the backend registry** — it belongs to the app's
  frontend/build, projected from the contract, not mounted into Hono.
- Supersedes nothing; refines C050's HYBRID rule into a decidable test. Every subsequent `Cxxx` module ADR cites this rule.
