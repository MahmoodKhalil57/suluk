# C39. `@suluk/journeys/hatch` — escape hatches for BDD (compose as a user by default; auth/OAuth + state services as a marked, prod-safe fallback)

> **Provenance:** Candidate-fork ADR (Suluk), not a SIG decision. Adds a deliberately-secondary subpath,
> **`@suluk/journeys/hatch`**, that lets a BDD scenario step OUT of the user-path when — and only when — a real user
> cannot do the job: AUTH bootstrap (OAuth — you can't script a Google login), an irreducible precondition with no API,
> internal-state inspection a `Then` can't observe, and teardown. The default stays "compose BDD AS A REAL USER" through
> `@suluk/sdk` (C038). Operator-directed: *"allow easy connection to these services but only as a fallback; preferably
> compose all BDD as an actual user, but sometimes we need hatches like OAuth."* Decided by a security-led council
> (`wf_d65d8c26-0eb`, 5/6 → the thin in-package design) grounded in toolfactory (Better-Auth Google-OAuth-only; D1 + KV).

Date: 2026-06-29

## Status

Accepted (candidate-fork). Decision ceiling **0.5** — Originated. Ledger: [`0hatches.bn`](../../../plan/facts/0hatches.bn)
(burhan True, converge clean **289**). **Safety-model update (operator-directed):** no separate test infrastructure is
provisioned. A hatch runs against **local** (`bun:sqlite` over the miniflare D1 — completely local, the recommended CI
path) or the **real deployment** (the seeded rows ARE test users — BDD-as-living-documentation). The write-safety guard
is **test-user scoping** (the precise guard — the real risk was *unscoped* destructive ops, never "prod" itself), built
+ unit-witnessed. The auth-mint's live correctness is still the consumer's to wire, but can now be **witnessed entirely
locally** (no throwaway account needed).

## Context

C038's `@suluk/journeys` composes BDD as a real user, driving the live API through `@suluk/sdk` — high-fidelity,
black-box. But some preconditions have no user-path. toolfactory makes this concrete: it is **Better Auth with Google
OAuth only** (email/password off), sessions are cookies backed by D1 — so "be a signed-in user" genuinely cannot be
scripted as a user. The classic BDD answer is white-box state manipulation; over-using it erodes the very fidelity the
suite exists for. So the design question is not *whether* to allow state access, but how to keep it an **easy but
secondary, visible, minimized, prod-safe** escape — never the default.

## Decision

A thin module at `tooling/ts/packages/journeys/src/hatch/`, exported under the subpath **`@suluk/journeys/hatch`**
(5/6 council — the smallest seam; reuse `@suluk/cloudflare`'s REST + `@suluk/env`, don't mint a new package).

1. **User-default by surface asymmetry.** A plain bound `When` lowers to `client.<acc>(...)` with zero ceremony; a hatch
   additionally requires importing `@suluk/journeys/hatch`, CF creds, and a resolved target. A scenario composed as a
   user imports **none** of the hatch subtree — opt-in by absence. `Given I am a signed-in user` stays bound to
   `@access:authenticated`, unchanged.
2. **The auth hatch — `signInAs(...)`, fail-closed, never a false green.** It **never hand-forges** a session row: the
   consumer supplies `mintSession` (Better Auth's **own** server-side session create — only the app knows its session
   shape). The hatch then **self-verifies**: it round-trips the minted cookie against one real authenticated endpoint
   and **throws** if the app rejects it, so a subtly-invalid session fails loud instead of manufacturing confidence.
3. **Two backends, no test infrastructure (operator-directed).** `resolveBackend({ mode: "local", d1Path })` is
   `bun:sqlite` over the miniflare local D1 — completely local, the recommended CI path. `resolveBackend({ mode:
   "remote", cf, d1DatabaseId, acknowledgeRealDeployment: true })` runs against the **real deployment**: the seeded
   rows ARE test users (an explicit acknowledgement, not an accident).
4. **The state hatch — `stateHatch(...)`, capability-by-type + test-user-scoped.** Read-only by default; the write
   methods exist only when `{ write: true }` is granted. **Test-user scoping is the write-safety guard** (works on local
   and prod alike): `seed(table, ownerColumn, rows)` **forces** the owner column to the test-user id (you can't seed
   another user's row); `cleanupScope` deletes only that user's rows; raw unscoped `exec` is **refused on the real
   deployment** (local-only). All values bound params; identifiers validated; `seed` requires a `because` audit.
5. **Service set — only manipulable state.** Coded v1: **D1** (over both backends; the auth-session substrate). The KV
   data-plane verbs landed in `@suluk/cloudflare`, but the hatch's KV surface is deferred. Designed-in-the-seam, not
   built: KV-hatch-surface, Vectorize, Queues, R2-objects, Analytics Engine. **Excluded** (stateless invoke-only):
   Workers AI, Browser Rendering; Workers/Pages = inspect-only deployment metadata.
5. **Data-plane lives in `@suluk/cloudflare`** (handrews' whose-job): `queryD1` is now params-aware; `d1Rows`,
   `kvGet`/`kvPut`/`kvDelete`/`kvList`, and a `requestText` (raw KV values) were added as siblings.

## The contract wall (the strongest, witnessed property)

A hatch is runtime IO; it is provably outside the deterministic core. The projector/binder (`vocabulary.ts`, `bind.ts`,
`gherkin.ts`, `normalize.ts`) import no hatch, no `@suluk/cloudflare`, no env, no `fetch`; the emitter/barrel import
neither the hatch nor the CF write-client. v1 adds **no contract facet**, so `buildAda`/`matchRequest` stay invariant.
Witnessed by [`test/hatch-wall.test.ts`](../../../tooling/ts/packages/journeys/test/hatch-wall.test.ts). No SQL, creds,
tokens, or service ids ever enter the v4 document.

## Safety — test-user scoping (built + witnessed) and what remains

- **Built + witnessed** (`test/hatch.test.ts`, including a real `bun:sqlite` round-trip): test-user scoping — `seed`
  forces the owner column to the test-user id; `cleanupScope` deletes only that user's rows (a co-resident "real user"
  row is left untouched); raw `exec` is refused on the real deployment. Capability-by-type read-only default;
  params-binding + identifier validation; the `CloudflareError` body-leak scrub; the auth hatch's fail-loud self-verify.
- **Why this is the right guard:** the real risk was never "prod" — it was an *unscoped* destructive op. Scoping closes
  that on prod and local alike, which is what makes "use prod, treat them as test users" safe (and fits BDD-as-living-
  documentation / synthetic-monitoring practice). **Residual risk, honest:** a bug in a consumer's `ensureUser`/
  `mintSession` could still seed a malformed row; prefer `mode: "local"` for CI and the real deployment for periodic
  high-fidelity runs. A least-privilege CF token scoped to the one database is still recommended defense-in-depth.
- **Teardown is best-effort, not guaranteed:** scoped `cleanupScope` + try/catch; the designed-but-unbuilt backstop is a
  run-prefix tag + a standalone `journeys reap` sweep.
- **The auth-mint is unwitnessed but now LOCALLY witnessable:** the forward obligation is a self-test (mint via the
  app's Better Auth → call an authenticated endpoint as a user → assert non-401), which `mode: "local"` lets you run
  **completely locally** against `bun:sqlite` + a local Better Auth — no throwaway CF account required.

## Consequences

- `@suluk/cloudflare` grows D1 params + KV verbs + `requestText` (a minor version bump when published).
- toolfactory gains a real OAuth hatch path once the auth-mint self-test passes on a throwaway target.
- **Honesty carried forward:** ceiling 0.42; prod-safety, the CF-scoped token, the auth-mint witness, the reaper, and
  the binder-side `HatchUse` visibility marker + minimize-hatch lint are all explicit forward obligations, not laundered
  as done. The strongest parts (contract wall, fail-closed guard, capability-by-type, fail-loud auth verify) are built.
