# C40. `@suluk/journeys` examples + scenario outlines + `@suluk/stubgen` — closing the tester→backend loop

> **Provenance:** Candidate-fork ADR (Suluk), not a SIG decision. Extends the journeys arc ([C038](C038-suluk-journeys-bdd.md)
> vocabulary + tri-state gaps, [C039](C039-suluk-journeys-hatches.md) escape hatches) into a **bidirectional loop**: a
> tester expands generated **Scenario Outlines**, runs them immediately (C038 runnable + C039 hatches), curates which
> **examples** become public, and — where a scenario needs an operation the contract lacks — **shapes the backend** via a
> generated contract + handler stub the maintainer fills in. Operator-surfaced over this session; the three architecture
> forks (example storage, package layout, stub-gen home) were put to the operator and decided **by the operator** (no
> council — the contested part was the forks, now resolved): **(1) promote examples into Zod**, **(2) all inside
> `@suluk/journeys`**, **(3) a generic `@suluk/stubgen` now**.

Date: 2026-06-30

## Status

Accepted (candidate-fork). Decision ceiling **0.45** — Originated, projection-model-native, **mechanism designed +
P2 resolver witnessed by package tests; the tester-in-the-loop UX and the source-writing promote step are unwitnessed**.
Ledger: [`0journeys-examples.bn`](../../../plan/facts/0journeys-examples.bn) (burhan True, converge clean). Rides the
C038/C039 wall — **no new contract facet, no new D1 surface**. No SIG prior (BDD + example-synthesis are out of OpenAPI's
normative scope) — a tooling-layer decision riding the same projection model as the rest of the journeys arc.

## Context

C038 gives a non-technical author a way to write intent and learn which intents the contract can back; C039 lets those
intents run without a maintainer (auth/state hatches). Two edges of the operator's loop are still missing:

1. **Forward, richer:** the author gets a step *palette*, but not a **parameterized Scenario Outline** with an
   `Examples:` table seeded from the schema — the natural surface for "give me the shape, I'll fill the rows."
2. **Backward, generative:** C038 *classifies* a `NEEDS-CONTRACT` gap but stops there. The operator wants a tester to be
   able to **shape the backend** — pre-write the scenario, and have a script emit the contract + handler **stub** the
   maintainer then writes pragmatically.

Plus a cross-cutting concern the operator named directly: **field examples have three honest sources** (synthetic from
the schema; a maintainer-authored example; a tester-curated *public* example a tester is willing to expose) and need a
**precedence**, because a tester "might not want to show all their payloads." The whole point of Suluk is that the **Zod
contract is the single traceable source of truth** (no JSDoc/comments — `@suluk/hono`'s `contract()` → `zodToV4()`), so
the examples must resolve back to that source, not drift into a parallel store.

## Decision

Four pieces (P1–P4). The contested shape was three forks; the operator's calls are recorded inline.

1. **P2 — example precedence resolver, in `@suluk/journeys` (`src/examples.ts`).** A pure, **deterministic** function
   `resolveExample(schema, { public?, maintainer? }, hint)` → `{ value, tier, synthetic, provenance }` with precedence
   **`public` > `maintainer` (explicit, or the schema's own `examples`/`example`/`const`) > `synthetic`**. Tier 1 is a
   **deterministic schema synthesizer** (`synthesize(schema, hint)`) honoring `const`/`enum`/`default`/`format`/length +
   numeric bounds. **Deviation from the operator's "take the faker dep" framing (recorded):** v1 uses a deterministic
   synthesizer **with no external faker dependency** — it is stable (BDD tests don't flap), self-contained
   (one-file-extractable), and aligns with the arc's **never-launder** discipline (a synthetic value is always
   lowest-precedence, always overridable, and carries `synthetic: true`); the same interface can later accept
   `@faker-js/faker` for richer values behind the seam. *This precedence IS the reconciliation with never-launder:*
   nothing synthetic is ever presented as authoritative.
2. **P1 — Scenario Outline generator + outline-aware parse/emit, in `@suluk/journeys`.** `generateScenarioOutlines(doc)`
   emits, per operation, a `Scenario Outline:` whose `Examples:` columns are the request fields and whose seed row comes
   from P2; the parser (which already tokenizes `Scenario Outline`/`Examples`) is extended to **capture** the table; the
   emitter iterates rows. The binder's tri-state is unchanged.
3. **P3 — `@suluk/stubgen` (new package), generic now, via an adapter seam.** It emits the **contract** half generically
   (a `RouteContract` literal — the `@suluk/hono` shape — with request/response Zod **inferred honestly-provisionally**
   from the Examples columns + `Then` assertions, `// TODO: tighten`), and the **handler** half through a `HandlerTarget`
   adapter (mirroring `@suluk/deploy`'s `DeployProvider` / C034's `AgentRuntimeProvider`). The first adapter is
   toolfactory's **Effect + `run()` + `RouteError<name>`** target, supplied by the consumer. `@suluk/core` never imports
   `@suluk/stubgen` (the C027 module-boundary rule, test-enforced).
4. **P4 — promote-into-Zod (operator's fork #1).** A tester marks an `Examples:` row `@public`; a `promote` script lifts
   that row into the matching Zod schema as `.meta({ examples: [...] })`, provenance-stamped, so **Zod is the literal home
   for every example**. Once promoted, tier-2 and tier-3 share the Zod home and are disambiguated by the stamp; the
   resolver still ranks `public > maintainer > synthetic`. The promoted example then flows into the rendered docs
   (`@suluk/reference`/`scalar`) as the request/response `.example`.

## D1 gate

Examples are **values**, so they stay where values are allowed (`.example`/`examples` annotations) and **never enter the
static matcher** — `buildAda`/`matchRequest` are invariant to any example. No `x-suluk-*` facet is minted. The
value-synthesis layer (`examples.ts`, the outline emitter) is walled off from the **pure projector core**
(`vocabulary.ts`/`bind.ts`/`gherkin.ts`/`normalize.ts`), which must not import it — a source-level forbidden-import test
[`test/examples-wall.test.ts`](../../../tooling/ts/packages/journeys/test/examples-wall.test.ts) enforces it, cloning the
C039 `hatch-wall.test.ts` gate. `examples.ts` is self-contained (no journeys-internal, no external import) so it remains a
one-file extraction if `@suluk/reference`/`sdk` later want the resolver.

## Honesty / forward obligations

- **Ceiling 0.45**, originated. Witnessed in v1: the P2 resolver + its precedence + determinism + the wall (package
  tests). **Unwitnessed:** the tester-in-the-loop UX (does an Examples table feel intuitive to a real QA?), the
  source-writing `promote` step (it edits the maintainer's Zod — idempotent + marked + diff-reviewed + tripping
  `mizan_check_action_safety` when wired, but unbuilt at this ADR), and `@suluk/stubgen`'s inferred Zod (lossy by
  construction; the maintainer owns the final schema — never laundered).
- **Deviation logged:** no external faker dep in v1 (deterministic synthesizer), against the operator's "take the faker
  dep" framing — for determinism + never-launder; reversible behind the resolver seam.
- **Build order (cheapest-first, piloted on toolfactory's `convert`):** P2 (this ADR's witnessed slice) → P1 → P4 → P3.
- **Khazīna candidate (flagged, not added):** the bidirectional *tester-shapes-backend* loop + promote-into-Zod-with-
  precedence is a novel structural move; it qualifies only **after** an author-in-the-loop witness, per the
  add-an-atom discipline (no atom on a forward hypothesis).
