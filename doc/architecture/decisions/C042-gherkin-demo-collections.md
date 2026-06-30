# C42. Gherkin → Bruno/Postman demo collections (a second emit target on the journeys arc)

> **Provenance:** Candidate-fork ADR (Suluk), not a SIG decision. Adds a SECOND emit target to `@suluk/journeys`
> (`demos.ts`): a bound feature set → a **Bruno** or **Postman** collection a tester clicks through to showcase a feature
> START-TO-END on a LIVE environment during a call. Operator-surfaced: *"a way to allow testers to write demos using
> Gherkin that compile to bruno or postman so that they can showcase features start to end on production … in a live
> call"* + the dual-use follow-up: *"this can also be used by developers to generate bruno or postman to test locally
> before others run the demo live on production."* Reuses the C038/C040 binding + the C041 origin/chaining model.

Date: 2026-06-30

## Status

Accepted (candidate-fork). Decision ceiling **0.5** — Originated. The mechanism is witnessed (IR + both renderers +
sourced chaining); the **format fidelity** is "good enough to import + run" (the essential Bruno `.bru` / Postman v2.1
shapes), not a guaranteed-complete schema — bounded honestly. Ledger: [`0demos.bn`](../../../plan/facts/0demos.bn)
(burhan True, converge clean). No new facet — a downstream consumer of the contract, exactly like `emitRunnableSuite`.

## Context

`emitRunnableSuite` (C038/C040) already lowers a bound scenario to a runnable `bun:test` suite driving the SDK client —
great for CI, wrong shape for a **live demo**: in a call you want a clickable, ordered set of HTTP requests in a tool the
audience recognizes (Bruno / Postman), pointed at production, that visibly chains real responses. And a developer wants
the SAME artifact pointed at `localhost` to rehearse before the call. The binding, the row→value lowering, and the
`sourced`→chaining model are identical to the runnable emitter; only the **target** differs (a raw-HTTP collection, not a
typed client call).

## Decision

A new module `tooling/ts/packages/journeys/src/demos.ts` — three composable functions, same binding, a target-agnostic IR.

1. **`compileDemos(doc, vocab, features) → DemoScenario[]` — the IR.** Reuses `bindFeatures`; each bound `When` becomes a
   `DemoRequest` (method + path + auth + JSON body). The body is built from the scenario's **first Examples row** when
   present, else **synthesized** from the schema (C041 origin-aware: `computed` dropped, `input` synthesized) — so a demo
   is concrete with or without a table. A **`sourced` field becomes request CHAINING**: it renders as a `{{var}}`
   reference, and the SOURCE request (the prior bound `When` whose op produced it) gains a **capture** of that field —
   the live-call equivalent of `resolveSourced`. Path params substitute a row value or a `{{param}}` variable.
2. **`renderPostman(demos) → string`** — a Postman Collection v2.1.0 (scenarios = folders, requests = items); a `test`
   event carries a 2xx assertion + the captures (`pm.collectionVariables.set`); the body templates `{{var}}` refs.
3. **`renderBruno(demos) → Record<string,string>`** — a Bruno collection as a file map (`bruno.json`, per-request `.bru`,
   environments); captures via a `script:post-response` `bru.setVar`; an `assert { res.status: lt 300 }`.
4. **Environment-agnostic IR = the dual use (operator follow-up).** The IR holds no URL — only `{{baseUrl}}`. Both
   renderers emit a **local** and a **prod** environment (`baseUrl` defaults to a `wrangler dev` port so a fresh import
   runs against localhost FIRST); the presenter switches `baseUrl` to prod for the live call. ONE collection, a developer
   rehearses locally, the tester runs it live — the only difference is the variable. `token` is a variable the presenter
   sets; auth'd ops get a `Bearer {{token}}`.

## D1 / wall

`demos.ts` is a downstream consumer — it reads the bound scenarios + the resolved ops + the schema; it mints **no facet**
and never touches `buildAda`/`matchRequest`. It sits on the VALUE/emit side (it imports `@suluk/examples`' synth + the
binder), exactly like `emit.ts`; the pure projector core (`vocabulary`/`bind`/`gherkin`/`normalize`) does not import it.
Example values + captured chaining vars are runtime test/demo data, never contract facts.

## Consequences / honesty

- **Ceiling 0.5.** Witnessed: the IR (order, body-from-row-or-synth, `sourced`→capture+`{{var}}`, auth), and both
  renderers (the chaining round-trips in each format). **Bounded honestly:** format fidelity targets import-and-run, not
  full Bruno/Postman schema completeness; path/query demo wiring is `{{param}}`-stubbed where not a body field; a numeric
  `sourced` value templates as a quoted string (sourced ids are strings — the common case). The 2xx assertion is a smoke
  check, not the op's declared status set (OpInfo doesn't carry statuses; a future pass can read `op.responses`).
- **Deferred:** reading the op's real declared statuses; a CLI/bin that writes the file map + opens the collection; a
  per-Examples-row demo variant (v1 uses the first row); richer assertions from `Then` steps.
