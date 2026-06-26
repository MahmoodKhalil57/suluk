# C37. `x-suluk-store` + `x-suluk-notify` — the reactive-client facet (contract-declared frontend state)

> **Provenance:** Candidate-fork ADR (Suluk), not a SIG decision. Defines two paired vendor facets — the per-operation
> `x-suluk-store` and the document-level `x-suluk-notify` — that let the contract declare how the FRONTEND turns
> operations into reactive **state** (a query backs a store), **events** (a mutation invalidates stores), and
> **callbacks** (a success message + a status→severity notify policy). With them, `@suluk/sdk` can GENERATE a
> ready-to-use reactive client, not just a typed RPC bag. Defined by **explicit operator direction** (toolfactory
> session 2026-06-26: "in the backend we define how we expect frontend to setup their states and events and callbacks
> so @suluk/sdk just generates a ready to use frontend package"). Grounded in one read-only prior — the live boilerplate
> a real consumer (toolfactory) hand-writes today: `stores/session.ts` (nanoquery stores), `lib/api-toast.ts` (a
> status→toast policy), and a per-panel `load()` + refetch-after-mutation dance — exactly what this facet would emit.

Date: 2026-06-26

## Status

Accepted (candidate-fork). Decision ceiling **0.5** — Originated + **generator-not-yet-built** (this Step ratifies the
facet; the `@suluk/sdk` reactive codegen + the nanostores runtime adapter are the deferred follow-on, per the operator's
"spec ADR first" sequencing). Tracks C027/C028/C036's originated ceiling. Ledger:
[`0reactive.bn`](../../../plan/facts/0reactive.bn) (burhan True, converge clean). **D1 gate passed** — an independent
maintained witness ([`test/store-d1-invariance.test.ts`](../../../tooling/ts/packages/core/test/store-d1-invariance.test.ts))
proves `buildAda`/`matchRequest` are byte-identical with vs without an `x-suluk-store` / `x-suluk-notify` block.

## Context

A v4 contract already produces a complete, typed RPC client (`@suluk/sdk`): entity-grouped methods, validated inputs,
`.cost`/`.requires` metadata. But a reactive frontend needs more than typed calls — it needs **stores** (a query's
result as observable state), an **invalidation graph** (which mutation refreshes which query), and a **notify policy**
(which response statuses surface to the user, and how). Today every consumer re-derives that by hand. The motivating
evidence is a real one: in toolfactory, three files do exactly this work — `stores/session.ts` wires nanoquery
`$session`/`$credits`; `lib/api-toast.ts` is a status→toast Proxy (402→error, 429→warn, 2xx→silent…); and every
dashboard panel (Billing/Account/Security) hand-writes a `load()` + a manual refetch after each mutation. All of it is
mechanical and re-invented per project — precisely the kind of thing the contract should declare once and the SDK
should generate.

The operator's framing names the three pieces directly: **states, events, callbacks**. Building it now is defensible
under the **operator-surfaced-cowpath** pattern that justified C027/C036 (the operator owns the call), provided the
build is honest about being generator-thin (no projection exists yet) and stays structural-only — the same discipline
those originated, low-ceiling facets used.

## Decision

Define two paired OPTIONAL vendor facets, riding the C025/C027/C036 precedent EXACTLY (additive, no new normative kind,
no meta-schema change, never read by the matcher):

- **`x-suluk-store`** (per-operation, on a `Request` — beside the shipped `x-suluk-ratelimit`/`x-suluk-approval`). The
  operation's role in the reactive client:
  - **QUERY role** (`key` present): the result backs a `$<key>` reactive store. Hints: `ttl` (cache seconds),
    `revalidateOnFocus`, `params` (the path/query param **names** — never values — that key a parameterized store family).
  - **MUTATION role** (`invalidates` present): on a 2xx, invalidate the named store `key`s → the client refetches them.
  - `onSuccess` — an advisory success message the callback layer surfaces (text declared, renderer injected).
- **`x-suluk-notify`** (document-level, beside `x-suluk-jobs`/`-agents`/`-policy`/`-resources`). A status→severity map
  keyed by an HTTP status (`"402"`), a status CLASS (`"2xx"`/`"4xx"`/`"5xx"`), or `"network"`; the value is one of
  `silent` | `info` | `success` | `warn` | `error`. A specific status beats its class.

**The role discriminator (mirrors C027's presence-of-`model`):** a store plays ONE role — presence-of-`key` is a query,
presence-of-`invalidates` is a mutation; a future lint flags an op declaring both. The operator's three terms map
cleanly: **states** = `key`; **events** = `invalidates`; **callbacks** = `onSuccess` (success) + `x-suluk-notify`
(error/status policy).

**The wall (the load-bearing safety property — STRONGER than every prior facet's D1 claim):** this is the first facet
whose ONLY consumer is the `@suluk/sdk` FRONTEND codegen. The other `x-suluk-*` facets at least feed runtime-advisory
selection; this one touches **no server path at all** — not `buildAda`, not `matchRequest`, not agent/job/policy
selection. And every field names an author-chosen store name, a param **name**, a config scalar, an advisory message, or
an HTTP status — **never** a request/header/body/query **value** — so nothing here can leak into a selector even if a
future reader consulted it (the wall C018 puts around callback keys, C024 around the attribution expression).

**Target-agnostic (the C034 seam, one layer up):** the facet declares a dependency GRAPH + cache hints + a status
policy — NOT a nanostores program. The default `@suluk/sdk` adapter projects it to **nanostores + @nanostores/query**
(peer deps, same bring-your-own model as ofetch); a different adapter could target TanStack Query / SWR / Pinia Colada.
The notify policy projects to an INJECTED `notify(severity, problem)` renderer — policy declared, rendering injected.

## Consequences

**Easier:** the contract declares the reactive surface once; `@suluk/sdk` can generate stores + the invalidation graph
+ the notify wiring, so a consumer drops the hand-written store/toast/refetch boilerplate (the three toolfactory files
become generated). The states/events/callbacks vocabulary is now first-class and lint-gateable. The inconsistent
generator naming a consumer hits today (e.g. `paymentMethods.list` vs `methods.default_` vs `billing.portal`) gets a
natural place to be normalized when the reactive layer lands, because store `key`s are author-declared identities.

**Harder / watch:** the facet is **generator-thin** — no projection exists yet, so the design is unwitnessed by a real
emit; the honest mitigation is the low ceiling (0.5) and the spec-first sequencing (ratify the shape, then build the
codegen against it). A consumer must still wire the notify renderer + pick a framework binding (`@nanostores/react`
etc.) — the facet declares, the consumer injects. The `D1` invariance must hold as a regression tripwire (the witness
enforces it); because the facet is client-only, that invariance is the strongest of any facet, but the tripwire stays.

**Not done here (deliberate, the deferred follow-on):** the `@suluk/sdk` `generateStores(doc)` projection (query stores
+ the mutation→invalidation graph + the injected notify adapter); folding a `lintStores`
(query/mutation role-exclusivity, dangling `invalidates` keys, duplicate store `key`s) into the grading rubric; wiring a
real consumer (toolfactory) to emit the facet from its contract and consume the generated stores.

## Parity boundary (council-verified, 2026-06-26)

A subsequent operator question — "can the backend define how the frontend shapes state, events, callbacks, error
handling, AND multi-call or zero-call actions, or reach parity with hand-written code?" — was put through an adversarial
panel (an 8-agent workflow: ground-truth from these files + a parity bar from TanStack Query / RTK Query / SWR / Apollo /
tRPC, then three independent skeptic lenses — D1-safety, contract-overreach, composability; all returned
*holds-with-caveat* and converged). The verified standard, which **bounds how this facet may grow**:

**The governing split — POLICY vs PLUMBING vs BEHAVIOR.** A reactive layer decomposes into three kinds, identically
across every mature system: **POLICY/IDENTITY = data** a spec can hold (store keys, the invalidation edge graph,
status→severity); **PLUMBING = mechanical execution of policy** a generator emits (refetch-on-invalidate, problem
parse); **BEHAVIOR = arbitrary function bodies** (selectors, merges, redirects, orchestration) reachable **only through a
typed injection seam** ("name and type the hole; the app fills it"). Parity is therefore **NOT** "generate the whole
reactive layer" — it is **declare every POLICY, emit every PLUMBING, type a seam at every BEHAVIOR site.**

**The seam mechanism = an unjs `hookable` hook-bus.** Rather than the generator inventing a bespoke callback-bag, the
generated reactive client exposes a typed [`hookable`](https://unjs.io/packages/hookable) instance — ecosystem-parity
with `ofetch` (already the SDK's runtime), tiny, tree-shakeable, target-agnostic. The app TAPS typed lifecycle hooks
(`request:error` `{ op, problem, severity }`, `mutation:success` `{ op, store }`, `mutation:settled`, `store:invalidate`,
`notify` `{ severity, problem }`) instead of receiving a fixed config object. So the DECLARED status→severity policy
*classifies* and *emits* the hook; the app's tap *renders/acts* — POLICY stays in the contract, BEHAVIOR stays in app
code, and every behavior site (onSuccess/onError/onSettled/onMutate/notify) is a uniform, typed `hooks.hook(name, fn)`
seam with zero new bespoke surface. `hookable` becomes the third generated-output peer dep beside `nanostores` +
`@nanostores/query`.

**Declare LESS, not more.** The contract declares ONLY what is backend-owned AND composition genuinely cannot recover:
store `key`/`params`, the mutation→query invalidation graph, and the status / RFC-9457-`type` → severity map. It does
**NOT** declare client-runtime tuning (retry/backoff, `gcTime`, `refetchInterval`, `fetchPolicy`) or per-op notify
**overrides** — those are **target-specific adapter config** (TanStack vs SWR vs nanostores diverge), so declaring them
breaks the C034 target-agnostic property. Nor derived/computed state, normalized cache, or optimistic/rollback — those
are BEHAVIOR (typed seams) or app-config, never spec.

**Multi-call and zero-call actions = composability, NOT declaration — do not build `x-suluk-action`.** A *real*
multi-call action needs inter-step data binding + branching = a mini-expression-language a runtime would interpret
(breaking D1); its D1-safe subset (a branch-free DAG of refetch/invalidate edges) is *barely more than `invalidates` +
three lines of app code*, so it is high-overreach for ~zero value. Orchestration is volatile, target-specific UX flow —
a category error in a stable, target-agnostic API contract. A zero-call action references **zero operations**, so an API
contract structurally has nothing to declare and the backend can never own purely-local state. Parity for both is
recovered at the **consumer seam** (the generated client exposes raw typed calls + reactive stores; the app composes any
action over them with full type-safety) or, when orchestration is genuinely backend-owned, via a **server aggregate
endpoint** (collapse N calls into one operation → one declarable store) — never a client-orchestration DSL in the spec.

**The value-selector wall (claim 2) must be a maintained witness.** D1 here is TWO claims: `d1_store_selector_safe`
(matcher invariance) AND `store_no_request_value_selector` (no facet field is ever a JSON-pointer/path that extracts a
request/response **value**). The panel found that the *tempting* state-shaping extensions — pagination `nextCursorPtr` /
`hasMorePtr`, an optimistic-patch `idFrom`, an entity `keyFields`-as-extractor — would **silently breach claim 2** (a
response value feeding a later request): matcher-invisible, yet exactly the leak the wall forbids. Those resolutions
belong in the injected **adapter seam** (the app resolves the pointer in app code), never the contract. Claim 2 is now
witnessed structurally (see `test/store-d1-invariance.test.ts`) so any such field trips a gate instead of eroding the
wall. (`when`-style branching on a coarse status-CLASS boolean is the one action-ish mechanism that is clean — it feeds
nothing back into a request — but it is not enough to justify an action facet.)

**Sequencing.** Build `generateStores(doc)` for the *already-shipped* facet FIRST and prove parity on one real consumed
client (lifting this ADR's 0.5 "generator-thin, unwitnessed" ceiling) BEFORE declaring any new facet. The smallest
additions that would later earn their keep, in order: complete the cheap pure-data wins already in scope, then the
behavior **seam set** (`onError`/`onSettled`/`onMutate` named hooks, typed `Problem<TExt>`) — the actual parity
mechanism — then, only if data warrants, entity identity (target-gated). Net: **parity = a thin generated core + typed
composition seams, by construction — not an ever-richer contract.**

> Overlap note: `@suluk/nano-stores` ships a *runtime* `createApiStores(RouteContract[])` (per-op fetcher/mutator stores,
> Zod-guarded) that does NOT read this facet. `generateStores` is the **owned-source**, v4-doc + C037-facet-driven
> projection (the L3 codegen posture of `generateSdk`, self-contained output). A future consolidation could have
> `generateStores` emit code that delegates to `@suluk/nano-stores`' runtime; for now it emits self-contained source so a
> consumer's web bundle carries no `@suluk/*` runtime dep (the `generateSdk` property).

## Known limitations (deferred refinements)

Surfaced by the pre-publish adversarial review of `@suluk/sdk@0.2.1` (the generateStores review-fix pass,
commit `e012714`). Both are **non-regressions** — strictly better than the prior no-dedupe behavior — so they were
shipped, not blocked. Filed here as the durable home for whoever next touches `generate-stores.ts`.

- **Coarse `_seen` dedupe key — shared across an operation's argument tuples.** The error-toast deduper
  (`generate-stores.ts:210`, `const _seen = new Map<string, number | "network">()`) is keyed by **operation name only**,
  not by `(op, args)`. For a *parameterized* query family (one fetcher store invoked with different args), a failure for
  `args=A` and a failure for `args=B` that share the same `(op, status)` collapse to one notification until any call to
  that op succeeds (which clears the marker and re-arms — see the `_seen.delete(key)` on the success path at
  `generate-stores.ts:63`/`:69`). No permanent suppression; worst case is one missed toast for a *concurrently-distinct*
  argument failure. **Refinement when data warrants:** key `_seen` by `op + "\0" + JSON.stringify(args)` (mirror the
  NUL-delimited cache key the invalidator already builds at `:62`) so dedupe granularity matches per-arg fetch identity.
- **Single `_seen` namespace shared by query-keys and action-names.** Queries dedupe on their store key and actions
  `report(name, e)` on the operation name (`generate-stores.ts:110`); both live in the same `Map`. A theoretical
  collision exists only if an action name string-equals a query key AND they fail with the same status in the same
  window — extremely narrow and still self-healing on the next success. **Refinement:** namespace-prefix the two
  (`q:`/`a:`) if the collision ever shows up in practice.

Neither blocks the 0.5 → witnessed parity lift this ADR is sequenced toward; they are codegen-quality polish on the
already-shipped notify path, to be picked up only if a real consumer hits them.
