[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / [Registry](../Registry.md) / audit

# Audit — one CI conformance gate (dev)

A single dev/CI script that folds your platform's lifecycle gates, its input-hardening security grade, and its schema-fact readiness grade into one ship-readiness pass/fail — the one command your pipeline gates on.

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```bash
pnpm dlx shadcn@latest add MahmoodKhalil57/suluk/audit
# or:  npx shadcn@latest add MahmoodKhalil57/suluk/audit
# pin to a ref:  MahmoodKhalil57/suluk/audit#main
```

There are no `registryDependencies` — this is standalone dev tooling. The npm `dependencies` are installed and the one file lands in your app.

## What you get

One file drops into your app — yours to edit:

- **`scripts/conformance.ts`** (from `conformance.ts`) — the unified CI readiness pipeline. It loads your v4 "Suluk" contract from a path (`process.argv[2]`, defaulting to `openapi.v4.json`) and runs the full ship-readiness audit in one place, folding four independent dimensions into one pass/fail:
  - **lifecycle gates** — `conformanceGates(doc)` + `shipSummary(gates)` from `@suluk/cockpit` (valid doc, deploy shape, …); `shipSummary` returns `{ ready, line }`.
  - **security grade** — `auditDocument(doc)` from `@suluk/harden` (the input-hardening grade + score).
  - **readiness grade** — `auditReadiness(doc)` from `@suluk/harden` (the schema-fact readiness grade + score).
  - **combined grade** — `combineGrades([security.grade, readiness.grade])` from `@suluk/harden` collapses the two letters to `{ worst, average }`.

  It prints each gate, both grades, and the combined line, then **exits non-zero** when the gates block *or* the combined `worst` grade falls below the floor — otherwise it exits `0` with `✓ conformance PASSED`. Missing contract file exits `2`.

This is dev/CI tooling: **no runtime mount, no Effect service, no owned schema, no provision fragment.** Run it in your pipeline:

```bash
bun run scripts/conformance.ts [path/to/openapi.v4.json]
```

The wiring you own is the two knobs at the top of the file:

```ts
const GRADE_FLOOR: Grade = "B";              // the lowest combined grade CI accepts (A best … F worst)
const DOC_PATH = process.argv[2] ?? "openapi.v4.json";
```

Edit `GRADE_FLOOR` to tighten/loosen the bar, or change the `DOC_PATH` default to your emitted contract's location.

## Dependencies

**npm (`dependencies`):**

- [`@suluk/cockpit`](https://github.com/MahmoodKhalil57/suluk/tree/main/tooling/ts/packages/cockpit) — `conformanceGates` + `shipSummary` (the lifecycle / ship-readiness gates)
- [`@suluk/harden`](https://github.com/MahmoodKhalil57/suluk/tree/main/tooling/ts/packages/harden) — `auditDocument` (security grade), `auditReadiness` (readiness grade), `combineGrades` (the two letters collapsed to worst + average), and the `Grade` type
- [`@suluk/core`](https://github.com/MahmoodKhalil57/suluk/tree/main/tooling/ts/packages/core) — the `OpenAPIv4Document` type the script loads and passes to every audit

**Registry (`registryDependencies`):** none — the script reads a contract file off disk and mounts nothing.

## Own the wiring, npm the logic

This is the HYBRID pattern (ADR [C050](https://github.com/MahmoodKhalil57/suluk/blob/main/doc/architecture/decisions/C050-registry-distributed-framework.md)/[C052](https://github.com/MahmoodKhalil57/suluk/blob/main/doc/architecture/decisions/C052-npm-vs-registry-boundary.md)): you **own** the seam, and **npm** the grading logic.

- **You own** the script — the grade floor, the default contract path, the report formatting, and how it's wired into CI. Edit it freely.
- **The `@suluk/*` packages own** the audit dimensions, so a stricter or fixed grading rule flows to you via npm instead of forking into your pipeline:
  - `conformanceGates` / `shipSummary` (`@suluk/cockpit`) — the lifecycle gate set and the one-line readiness verdict.
  - `auditDocument` / `auditReadiness` / `combineGrades` (`@suluk/harden`) — the security grade, the schema-fact readiness grade, and the pure combinator that collapses the two letters to `{ worst, average }`.

A change to what counts as "ready to ship" reaches every consumer as a version bump; your CI stays a thin, owned wrapper over it.
