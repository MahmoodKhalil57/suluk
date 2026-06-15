# Suluk standards — the conventions every `@suluk/*` package holds

Ground truth for the principles below: [C001 charter](doc/architecture/decisions/C001-candidate-fork-charter.md),
[C002 recursive-state](doc/architecture/decisions/C002-recursive-state-mechanism.md),
[C022 live-document projection](doc/architecture/decisions/C022-live-document-projection.md),
[C023 the L3 line](doc/architecture/decisions/C023-contract-lifecycle-facets-and-the-L3-line.md),
[C032 extraction boundary](doc/architecture/decisions/C032-saasuluk-extraction-boundary.md), and the
[parity roadmap](doc/architecture/saastarter-parity-roadmap.md). When this file and those disagree, *they* win — this
is a digest, not a fork.

## 1. Contracts in, everything derived

One source of truth → the v4 document → every artifact. The source is a **Drizzle schema** (`@suluk/drizzle`), **Hono+Zod
route contracts** (`@suluk/hono`), or **Zod** (`@suluk/zod`). From the resulting v4 document, *everything else
projects*: SDK, stores, panels, docs, conformance tests, MCP tools, cost, access, deploy plan.

**The document is a PROJECTION, never hand-authored source.** Do not edit the generated v4 doc and treat it as truth —
change the source (schema/route/Zod) and re-project. (The exception is the *editor*, which authors standalone docs by
hand on purpose — but even there, validation/preview derive.)

Corollary: a new feature is almost always **"declare it in the contract"** or **"teach the projecting package,"** not
"write bespoke code in the app." If you're writing app code that *re-implements* a projection, stop.

## 2. The facet model — one declaration, both enforcement and docs

Cross-cutting concerns ride on the contract as `x-suluk-*` facets, declared once:
- `x-suluk-access` — who an operation is for (`anyone`/`authenticated`/`admin`, owner-scoping). Drives the runtime
  **gate** (`@suluk/hono` `enforceAccess`) AND the docs' "View-as" lens AND the conformance suite.
- `x-suluk-cost` — per-operation cost (estimate + components + trigger). Drives the cost explorer, the metering
  (`@suluk/cost`), and asserted cost claims.
- `x-suluk-source` — provenance (admin-only), scrubbed for non-admin viewers (`scrubSource`).

A facet is only trustworthy if it is **load-bearing**: the wire enforces it and `@suluk/testgen` asserts it. A facet
that nothing enforces is *decorative* — the parity roadmap calls this out as a real hole (custom `app.get` handlers
that declare access but never call the gate). When you add a facet, add its enforcement + its conformance claim.

## 3. The L3 line — render/generate, never host

From [C023](doc/architecture/decisions/C023-contract-lifecycle-facets-and-the-L3-line.md)/[C022](doc/architecture/decisions/C022-live-document-projection.md):
**renderers render; generators emit owned source / projections / host-bindings; nothing in Suluk becomes a hosted
runtime the user can't own.** Codegen (`@suluk/sdk`, `@suluk/shadcn`, `@suluk/nano-stores`, …) hands the user code they
own and can edit. Deploy (`@suluk/cloudflare`, `@suluk/deploy`) emits/executes a plan against *their* account. Never
build a black box the app must call home to. This is a FORBIDDING line — firm.

## 4. Workers-safe & pure (the runtime contract)

Every package must run unchanged on Cloudflare Workers, which means:
- **No Node-only APIs** on the hot path. Prefer Web standards (`fetch`, `crypto.subtle`, `CompressionStream`, `Blob`,
  `URL`). Per the repo's Bun defaults, prefer `Bun.*` / built-ins over npm shims for tooling.
- **Pure functions + injected ports.** A package takes its dependencies as arguments (a `db` resolver, a `fetch`, a
  KV getter) rather than reaching for globals — so the same code runs in dev and prod. The "inject the bytes / inject
  the db" seam is intentional (see `@suluk/cloudflare` `deploy()`, `@suluk/drizzle` `crudHandlers`).
- **Precompiled validators** (AJV standalone) — no `eval`/dynamic codegen (Workers forbid it; also makes them
  browser-safe, which the editor relies on).
- **Await-transparent terminals.** Query terminals (`.all()`/`.get()`/`.run()`/`.returning()`) are always `await`-ed
  so ONE code path serves bun:sqlite (sync, await-transparent) AND D1 (async). This is how the dev/prod CRUD twin was
  collapsed — *parity by construction, not by vigilance* (C032).

## 5. Package layout & tooling

A package is minimal and uniform:
- `package.json`: `name: "@suluk/x"`, `type: module`, `main: "src/index.ts"`, `license: "Apache-2.0"`,
  `publishConfig.access: public`, `exports` mapping `.` → `./src/index.ts` (+ `./dist/*` for any pre-built bundle),
  deps as `workspace:^` (rewritten to real versions on publish), `@types/bun` dev dep, scripts `test` (`bun test`) +
  `typecheck` (`tsc --noEmit -p .`).
- `tsconfig.json`: `{ "extends": "../../tsconfig.base.json", "compilerOptions": { "types": ["bun"] }, "include": ["src","test"] }`.
- `src/index.ts` is the public surface; `test/*.test.ts`; a `README.md` (what / when / usage / boundary). Ship **TS
  source** as main — consumers transpile. Only ship `dist/` for genuinely pre-built client bundles (e.g. `@suluk/editor`,
  the scalar fork), and gitignore those (regenerated/published, like `tooling/ts/scalar-fork/dist`).

## 6. Versioning & the publish workflow

Pre-1.0 (`0.x`), single primary consumer (saasuluk), both repos co-evolved — **no versioning/migration tax yet**
(C032 day-2 framing). Packages are consumed by apps as **published npm packages**, not workspace symlinks, so every
change is a round-trip:

```
1. edit @suluk/x  ·  2. bump its version  ·  3. publish  ·  4. bump the consumer's dep  ·  5. bun install --force
```

- Publish auth: `NPM_SULUK_TOKEN` lives in `tooling/ts/.npmrc` as `${NPM_SULUK_TOKEN}` and in the repo's `.env`
  (gitignored). Extract it without printing it; never echo a secret. Then `bun publish` from the package dir.
- `--force` on the consumer install defeats registry propagation lag (a fresh `^x.y.z` often won't resolve otherwise).
- Test (`bun test`) + typecheck (`bunx tsc --noEmit -p .`) the package before publishing. For money/auth changes,
  characterization/conformance tests come *first* (C032 §6).

## 7. Two contexts, one repo

- **Using the framework** (this skill): the `@suluk/*` packages + apps. Governed by these standards.
- **Authoring the spec** (the candidate v4 document itself): the `plan/` ledger, burhan/daftar, `Cxxx` ADRs — governed
  by the repo `CLAUDE.md` + the `grill-with-docs` skill. Don't intermix `Cxxx` (our candidate ADRs) with the SIG's
  `000x` numbering, and never PR/push to the OAI upstream (we are a read-only fork of it).
