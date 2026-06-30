# C41. `x-suluk-origin` — field-origin discipline (which fields a client may faker, which are sourced, which are computed)

> **Provenance:** Candidate-fork ADR (Suluk), not a SIG decision. Adds a per-property authoring convention,
> **`x-suluk-origin`** (+ an optional free-form `x-suluk-from`), authored in **Zod `.meta()`** and carried verbatim by
> `zodToV4` onto the property's JSON Schema, that classifies each field by where its value legitimately comes from:
> **`input`** (the client/tester is the authority — free, faker-able), **`sourced`** (retrieved from elsewhere — a prior
> operation, the auth context, another entity — so it is *wired*, never invented), or **`computed`** (server-derived — the
> client never supplies it). Operator-surfaced as the sharpening of C040's faker: *"mark fields that are genuinely defined
> by the validation and are faker-able … or if it is retrieved from somewhere else or calculated somehow."* It makes the
> tier-1 synthesizer **correct** (it stops inventing ids/totals), and feeds P3 stubgen (a `sourced` field is a foreign-key
> param; a `computed` field is not a request param) and a future `@suluk/sdk` `sampleInput`.

Date: 2026-06-30

## Status

Accepted (candidate-fork). Decision ceiling **0.5** — Originated. The **mechanism** is witnessed (the marker round-trips
through `zodToV4` and the request→operation matcher is invariant to it); the **vocabulary + author UX** (is a three-way
`input/sourced/computed` split the right cut, and intuitive to annotate?) is unwitnessed. Ledger:
[`0field-origin.bn`](../../../plan/facts/0field-origin.bn) (burhan True, converge clean). Rides C040 / C038 — **no core
facet, no meta-schema change, no new D1 surface**. The keyword tokens are a one-line rename while adoption is still zero.

## Context

C040-P2 gives a deterministic synthesizer, but a synthesizer that blindly fills **every** field produces broken example
rows and misleading docs: it invents a server-assigned id, a balance, a `total = qty*price`, a `createdAt`. The operator
named the missing distinction directly — a field is one of three kinds, and only the first is free for a client/faker to
fill. JSON Schema already half-expresses this with `readOnly` (response-only / server-set) and `writeOnly` (request-only),
but neither captures **`sourced`**: a request field the client *must* supply but cannot freely invent because the real
value comes from a prior step (a foreign key from a `create`, an id from the session). So we need one more axis, authored
where the single source of truth lives — **Zod** — not in comments.

**Witnessed up front (the load-bearing assumption):** `z.object({ x: z.number().meta({ "x-suluk-origin": "computed",
"x-suluk-from": "ledger sum" }) })` → `zodToV4` emits the property with `x-suluk-origin`/`x-suluk-from` **verbatim** and
zero warnings; `z.string().readonly()` → `readOnly: true`. So `@suluk/journeys` can read the marker downstream with no
change to `@suluk/core`, the meta-schema, or the contract authoring surface.

## Decision

1. **A per-property convention, no facet.** Author `…​.meta({ "x-suluk-origin": "input" | "sourced" | "computed",
   "x-suluk-from"?: string })`. It is carried by `zodToV4` onto the property's JSON Schema and read **only** downstream
   (the example synthesizer, stubgen, a future SDK input-sampler). `@suluk/core` never reads it — the C038 downstream-
   consumer posture. **Default `input`** (declare only the exceptions). **`readOnly` ⇒ `computed`** and **`writeOnly`** is
   honored on the response side, so existing JSON Schema semantics aren't re-authored.
2. **The reader + origin-aware synthesis, in `@suluk/journeys` (`src/examples.ts`).** `fieldOrigin(schema)` (explicit
   keyword > `readOnly`⇒computed > default `input`); `describeInputs(schema)` → per-top-level-field
   `{ name, origin, from, fakerable, required }` (the surface a client/SDK uses to know what it may fill). `synthesize`
   gains a `{ direction }`: a **request** example **omits `computed`** fields (a client never sends them) and a
   **response** example omits `writeOnly`; **`sourced` is synthesized to a type-valid representative but carries its
   origin in `describeInputs`/provenance** — completeness + validity for docs, while journeys binds that column to a
   prior step's carried output and the SDK leaves it for the caller (policy is the consumer's, the marker is the data).
3. **`x-suluk-from` is EITHER a free note OR a machine-wireable source edge (operator follow-up — "wire it so both the
   Gherkin DSL generator AND `@suluk/sdk` can use it").** For a `computed` field, or a `sourced` field you only want to
   document, it is a string (`"qty*price"`, `"from the create call"`). For a `sourced` field you want **wired**, it is a
   structured **`SourceRef` = `{ op, select? }`**: `op` is the source operation's **C009 by-name handle** (`op.name` — the
   same stable identity journeys and sdk already key on), `select` is a dotted path into that op's **response** to pull
   (default `"id"`). This declares a **dependency EDGE**, consumed by **two generators**:
   - **The journeys/Gherkin generator:** a `sourced` Examples column seeds as a reference token (`<createSubscription.id>`,
     not a faker value, so the tester sees it is wired); the runnable emitter captures each bound `When <op>` response into
     a scenario-scoped bag keyed by `op.name` and resolves the cell via the pure primitive
     `resolveSourced(captured, ref)`. This realizes C038's deferred "carried-data across a journey (v2 journey-as-unit)".
   - **The `@suluk/sdk` generator:** the field is surfaced in the method's typed metadata as a sourced edge (not a free
     required input), so a caller can skip/ chain it, and docs render "↳ supplied by `createSubscription.id`". **BUILT
     (2026-06-30):** every method carries `.fields` = the full `describeInputs` array (origin + the wireable `source`
     edge); `$manifest` stays the lean facet index. A runtime `sampleInput` (fill only `input` fields) stays the follow-on.

**Extraction (forced by the dependency graph, built 2026-06-30).** Wiring the sdk required the reader to sit BELOW both
sdk and journeys — `@suluk/journeys` already depends on `@suluk/sdk`, so sdk cannot import journeys (a cycle). The
self-contained `examples.ts` (built that way on purpose) was lifted verbatim into a new **zero-dependency leaf
`@suluk/examples`**; `@suluk/journeys` keeps a one-line re-export shim so its public API and the projector-core wall are
unchanged, and `@suluk/sdk` now depends on the leaf. This supersedes C040's "all inside `@suluk/journeys`" fork **for the
shared reader only** (the cycle made that fork infeasible); journeys remains the façade. Witnessed by
[`examples/test/wall.test.ts`](../../../tooling/ts/packages/examples/test/wall.test.ts) (the leaf imports nothing) +
[`sdk/test/origin-metadata.test.ts`](../../../tooling/ts/packages/sdk/test/origin-metadata.test.ts).
   Like C024's attribution `event-expression` and the C018 callback-key wall, the edge **never enters the static matcher**.

## D1 gate

The marker lives on inner JSON Schema **properties**; the matcher already treats body schemas as opaque (a body resolves
to the `#inline` signature sentinel → not-statically-determinable, never folding body shape into the static key). So
`buildAda`/`matchRequest` cannot consult `x-suluk-origin`/`x-suluk-from`. Witnessed by
[`core/test/origin-d1-invariance.test.ts`](../../../tooling/ts/packages/core/test/origin-d1-invariance.test.ts) (a
petstore stamped with the markers on every nested schema — the doc provably *contains* them — yields a byte-identical ADA
and identical `matchRequest` resolutions). No `x-suluk-*` facet is minted; `@suluk/core` stays ignorant of the convention
(the test stamps a raw keyword, proving the matcher ignores arbitrary property keywords). The round-trip itself is
witnessed by [`zod/test/meta-passthrough.test.ts`](../../../tooling/ts/packages/zod/test/meta-passthrough.test.ts).

**Reconciliation with C037 claim-2 (recorded, not laundered).** C037 deliberately kept a response→request value-dataflow
(`nextCursorPtr`, optimistic `idFrom`, `keyFields`-extractor) OUT of the `x-suluk-store` **facet**, arguing such
extraction belongs in the injected adapter seam. A wireable `sourced` ref declares exactly such an edge — so why is it
allowed here? Three reasons, operator-directed: **(a)** it is **not a matcher-read facet** — a property `.meta()`
annotation read only by client codegen (the witnessed invariance above), strictly further from the matcher than
`x-suluk-store` ever was; **(b)** it fits C037's own **POLICY / PLUMBING / BEHAVIOR** parity split — the ref declares the
dependency GRAPH (policy: which op, which field), the generator emits the wiring (plumbing), and the extraction runs in
generated client/journey code (behavior); the contract holds the edge, never the extraction; **(c)** it is an
operator-directed lift of a C037 *reserve*, the same operator-surfaced-cowpath pattern as C036, carried at a lowered
ceiling (0.5). The thing C037 forbids — a value-extractor where the **matcher or a server path** reads it — remains
forbidden and witnessed.

## Consequences / honesty

- **Ceiling 0.5.** Witnessed: the round-trip, the reader semantics, request-omits-computed, and the D1 invariance.
  Unwitnessed: that `input/sourced/computed` is the right vocabulary for a real author, and the downstream policies
  (stubgen treating `sourced` as a foreign key; an SDK `sampleInput` filling only `input`) — designed, not built.
- **Never-launder preserved + sharpened:** the synthesizer now refuses to present a server-set/derived value as a client
  input; a `sourced` value stays type-valid but is always tagged with its true origin, never laundered as free.
- **`computed` + `required` on a request** is a schema smell (a required field the client cannot provide) — surfaced, not
  hidden; the maintainer should make it `readOnly`/optional. (A future `harden`/lint check is the natural home.)
- **Deferred:** the SDK `sampleInput(op)` (fill `input` only); stubgen's use of `sourced`→foreign-key / `computed`→non-
  param; a lint for `computed+required`; whether `sourced` should also carry a structured (not free-string) source ref.
