---
name: suluk
description: >-
  Use when building on, consuming, or modifying the Suluk OpenAPI v4 framework and its @suluk/* TypeScript packages
  (in tooling/ts/packages, consumed by apps like saasuluk). Tells you which package to reach for and how to use it,
  the contract-first standards every package follows, and the discipline for deciding when to use a package vs extend
  it vs hardcode in the app vs create a new one — and when to suggest contributing back. Triggers: "which @suluk
  package", "add X to saasuluk", "should this be a package", "contribute to suluk", "is there a suluk primitive for".
---

# Suluk — using & contributing to the @suluk/* packages

Suluk is **two layers**: (1) the OpenAPI **v4** candidate spec, and (2) a **"contracts in, everything derived"**
TypeScript framework — ~33 `@suluk/*` packages in `tooling/ts/packages/` that take ONE source of truth (a Drizzle
schema / Hono+Zod route contracts / Zod) → a v4 document → and project *everything else* from it (SDK, admin panels,
docs, conformance tests, MCP server, cost metering, access enforcement, deploy). saasuluk (`../saasuluk`) is the
reference consumer. This skill is how an agent uses that surface *well* and grows it *correctly*.

## The one rule that explains the rest

**The v4 document is a projection, never hand-authored source.** You declare the contract once (schema/route/Zod);
the document and every artifact derive from it. So a feature is almost never "write code in the app" — it is "declare
it in the contract" or "teach the projecting package." Internalize that and the decisions below follow.

## The decision flow (run this every time you're about to write non-trivial logic)

1. **Is there a `@suluk/*` package for this?** → use it. Read `references/packages.md` (the full catalog + a
   "I need X → reach for Y" table). Do NOT re-derive what a package owns.
2. **Does a package *half*-cover it** (e.g. it ships the audit but not the transform, or the type but not the
   adapter)? → **complete it there**, don't work around it in the app. (C032 "completing-half-first".)
3. **Is it generic mechanism that no package owns yet?** → extend the closest package; create a new package only as a
   last resort. See `references/contributing.md` (adopt-by-default · extend-by-evidence · create-rarely).
4. **Is it app policy, data, an N=1 registry, or showcase glue?** → keep it in the app. Not everything generalizes;
   over-extraction is a real failure mode (C032 §5).

## The non-negotiables (every package holds these — see `references/standards.md`)

- **Workers-safe & pure.** No Node-only APIs on the hot path; pure functions + injected ports; precompiled validators;
  await-transparent query terminals (one code path for bun:sqlite dev *and* D1 prod). Bun for everything (`bun test`,
  `bun build`, `bun install`).
- **The L3 line.** Renderers *render*, generators emit *owned source / projections / host-bindings* — **never a hosted
  runtime** ([C023](doc/architecture/decisions/C023-contract-lifecycle-facets-and-the-L3-line.md),
  [C022](doc/architecture/decisions/C022-live-document-projection.md)). Codegen gives the user code they own.
- **Facets are first-class.** `x-suluk-cost` / `x-suluk-access` / `x-suluk-source` are declared once and drive BOTH
  enforcement and docs. The conformance suite (`@suluk/testgen`) makes them load-bearing, not decorative.
- **Adopt-by-default.** Use the package's common case; expose overridable defaults rather than forking behavior.

## When to suggest contributing back

Raise it the moment you notice any of these (details + the recipe in `references/contributing.md`):
- you're about to write **generic mechanism** (reusable beyond this one app) directly in the app — *mechanism down,
  policy up*;
- a package owns **half** a capability and the app is filling the other half by hand;
- the **same logic is duplicated** across instances/apps (the dev/worker twin smell);
- a package's common case needed an **escape hatch** you had to monkey-patch — the seam belongs upstream.

Gate it on three axes before proposing: **genericness** (is it mechanism, not policy?), **customizability** (clean
override/port surface?), **correctness** (tested — and for money/auth paths, a characterization test *written first*?).
Day-2 economics (pre-1.0, single consumer, co-evolved in one commit) mean extraction is nearly free *now* and only gets
costlier — so extract while malleable, but only what passes all three.

## Reference files (read on demand — don't load all at once)

- **`references/packages.md`** — the extensive catalog: every `@suluk/*` package by family, with *what it is*,
  *when to reach for it*, its *key entry points*, and *where it's extensible / half-built*. Start here for "how to use."
- **`references/standards.md`** — the standards in depth: the projection model, the facet model, the L3 line, the
  Workers-safe rules, the package layout, and the **publish → bump-consumer → `bun install --force`** workflow.
- **`references/contributing.md`** — the contribution discipline: adopt/extend/create, the three axes, the C032
  boundary principles, the "when NOT to extract" brakes, and the step-by-step contribution recipe.

## Adjacent (not this skill)

Authoring the candidate **spec** itself (the `plan/` ledger, burhan/daftar, `Cxxx` ADRs) is governed by the repo's
`CLAUDE.md` + the `grill-with-docs` skill — that's spec governance, separate from *using the framework packages*.
