# Journeys — runnable BDD over your v4 contract (dev)

Own-the-code BDD coverage gate: author plain-Gherkin user journeys against the step vocabulary
`@suluk/journeys` projects from your v4 contract, then bind + grade coverage as a `bun:test` gate.

> **CANDIDATE tooling — not official OpenAPI.** Part of [Suluk](https://github.com/MahmoodKhalil57/suluk),
> a single-contributor candidate for OpenAPI v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative.

## Install

```bash
pnpm dlx shadcn@latest add MahmoodKhalil57/suluk/journeys
# or: npx shadcn@latest add MahmoodKhalil57/suluk/journeys
```

This is **dev/CI tooling — no runtime mount.** It drops three files into your app and installs its
npm deps; nothing is added to your server.

## What you get

Three owned files (the wiring); the binding + grading logic stays in `@suluk/journeys`:

| file | target | what it is |
|---|---|---|
| `journeys.config.ts` | `journeys.config.ts` | The owned config — `featuresDir`, `contractPath` (your generated v4 doc), and `coverageFloor` (the lowest BDD grade CI accepts, `A`…`F`). |
| `example.feature` | `journeys/example.feature` | A plain-Gherkin sample story you replace with your product's real journeys. |
| `journeys.test.ts` | `src/journeys.test.ts` | The coverage harness — a `bun:test` that binds your `.feature` files against the contract and asserts the coverage floor. |

The harness (`journeys.test.ts`) is **a pure function of the document** — no server, no network. It:

1. Reads your generated v4 contract from `config.contractPath` and projects a step VOCABULARY with
   `generateVocabulary(doc)`.
2. Parses every `.feature` under `config.featuresDir` with `parseFeature(...)`.
3. Binds authored steps against the vocabulary **exact-or-unbound** with `bindFeatures(vocab, features)`
   and grades contract→authored coverage with `coverageGrade(report)`.
4. Fails when the grade drops below `config.coverageFloor`; logs `covered/total` ops and the uncovered
   gaps — **unbound steps are your worklist.**

It uses `test.skipIf` on a missing contract, so a fresh platform is **green** and the gate engages the
moment a contract exists at `contractPath`.

Every Gherkin phrase names a CONTRACT FACT — an operation, param, status, store key, or access role —
never a request VALUE, so authored stories stay on the safe side of the D1 wall.

## Dependencies

- **npm (`dependencies`):**
  - [`@suluk/journeys`](../../tooling/ts/packages/journeys) — the projection/bind/grade engine
    (`generateVocabulary`, `parseFeature`, `bindFeatures`, `coverageGrade`).
  - [`@suluk/core`](../../tooling/ts/packages/core) — the `OpenAPIv4Document` type the harness parses.
- **`registryDependencies`:** none — this item is self-contained dev tooling; it does not pull in `app`.

## Own the wiring, npm the logic

You **own** the harness wiring: `journeys.config.ts` (where the contract and features live, and the CI
floor), the authored `.feature` stories, and `journeys.test.ts` (yours to edit — retarget paths, add
features, tighten the floor). The deterministic vocabulary projection, exact-or-unbound binding, and
coverage grading flow from **`@suluk/journeys`** on npm — so a fix or improvement to how steps bind and
coverage is scored reaches you via a version bump, not a fork of your test harness.
