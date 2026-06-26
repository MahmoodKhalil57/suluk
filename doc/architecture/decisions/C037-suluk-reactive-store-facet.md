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
+ the mutation→invalidation graph + the injected notify adapter); the nanostores runtime; folding a `lintStores`
(query/mutation role-exclusivity, dangling `invalidates` keys, duplicate store `key`s) into the grading rubric; wiring a
real consumer (toolfactory) to emit the facet from its contract and consume the generated stores.
