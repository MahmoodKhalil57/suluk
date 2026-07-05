# C118 — a real `params` schema (bubbles + auto-validates), `InputOf`/`passthrough`, and a genuine `sulukFmt` soundness fix

> **Provenance.** A Suluk *candidate* decision (codename `asl-ojs`), authored by the single contributor, grounded in
> burhan/daftar/mizan — **not** a Moonwalk SIG decision. Operator-driven (2026-07-05), a direct follow-on to C117
> with three concrete violations named: *"should use a generic helper function instead of developer writing types
> in routes"* (the hand-written `provide`); *"`z.infer<typeof CreateReq>` should be bubbled up from the model
> through the service instead of having to import and write manually in routes"*; and, **most importantly**,
> *"instead of having to specify the inputs and their types in query function declaration `id: string`, we should
> have a separate field called inputSchema where a developer can add the zod validation for the input schema
> ideally directly inferred from the zod-drizzle schema declaration itself, so we can have it bubble up through
> service to route and merge types depending on the pipeline so we never have to maintain a separate source of
> truth to generate a truthful suluk document that represents the api actually."*

**Status:** BUILT + VERIFIED. `@suluk/effect` **163/163** tests pass (6 new). Full 46-package ecosystem sweep: zero
fail, zero typecheck errors. A 5-reviewer independent adversarial verification pass (cleanup-completeness,
soundness-adversary, doc-completeness, security-adversary, behavior-parity — each building its own throwaway
harness) found **zero blockers**; the two real findings it did surface are fixed below.

## The `params` field — a real, validated, bubbling path-parameter schema

Path parameters had **no schema representation at all** before this: `@suluk/effect`'s `RequestSlice` had `body`/
`query` but nothing for `:name` segments — the v4 document auto-derived a bare `{type:"string"}` for any `:id` in
the path template, and every by-id model hand-wrote `id: string` (or, for the composite case, a hand-nested
`{ id, patch }`) as the ONLY source of that type, with zero runtime validation of the id's actual format.

`sulukFn` gains `params?: z.ZodType<Params>` (mirroring `body`), `queryOne`/`queryMany`/`mutate`
(`registry/foundation/app/app.ts`) gain a parallel `params` field, and `findTodo`/`patchTodo`/`dropTodo` now declare
`params: todo.zodSchema.pick({ id: true })` — the exact ask: the id's nanoid format/description/example, defined
**once** on the column, is what validates *and* documents the path segment. `params` bubbles through `mergeSlices`
exactly like `body`/`query` (`inherit(own.params, deps, (s) => s.params)`) and is **enforced**, not just declared:
`sulukRoute`'s runtime handler parses `c.req.param()` against it before `run` ever sees the input — a malformed id
is a typed 400 (`{"issues":["Invalid nanoid"]}`), never a silent pass-through or a 500.

**`MergedInput<Params, Body>`** (exported) is `Params & Body` when both are declared, whichever one alone when only
one is, `void` when neither is — the SAME merge rule the runtime performs (`params`/`body`, each independently
opt-in-validated, spread into ONE flat object) is the type the model's `query`/`run` function receives. This is why
`patchTodo`'s query now destructures `{ id, ...patch }` from ONE flat input instead of a hand-nested `{ id, patch }`
— the path id and the body's `title`/`completed` arrive together, not as two separate concerns a model has to wire
up itself.

**Merge-order hardening (found by the security-adversary reviewer, fixed here):** the runtime spreads `body` first
and `params` last (`{ ...bodyPart, ...paramsPart }`), so a same-named key ALWAYS resolves to the path value, never
a caller-supplied body field — the path is the caller's identity; an arbitrary request body must never be able to
override it. Not exploitable in `todo` today (no field name collides, and zod strips unknown body keys by
default), but the ordering is now a real, tested guarantee (`test/suluk-fn.test.ts`: a deliberately adversarial
body schema declaring its own `id` field is proven to never win over the path's `id`), not an accident of which
schema happened to be declared first.

**`sulukFmt.all` (fan-out) does NOT bubble `params`/`body`** — confirmed by reading its implementation, which
constructs its own `RequestSlice` manually and deliberately omits them (each branch may need a different input; a
fan-out has no single shared shape to bubble). `getTodoDetail` — a fan-out over `getTodo` + `countTodos` on the
same id — declares `params: IdParams` on its OWN controller (reusing the model's exported schema via the service,
not re-deriving it) to close this gap; this is the one place `params` is stated at more than one layer, and it's a
structural necessity, not a restatement.

## `InputOf<Fn>` and `passthrough` — no re-import, no `z.infer`, no hand-typed shape in a route

`InputOf<Fn>` (mirrors the existing `ReqOf<Fn>` exactly: `Fn extends SulukFn<infer In, any, any> ? In : never`)
extracts a composed `sulukFn`'s input type. A controller types its `run` off the **service** it composes with —
`run: (ctx, body: InputOf<typeof S.createTodo>) => passthrough(ctx, body)` — never importing the model's schema or
writing `z.infer<typeof CreateReq>` by hand. This also fixes a real, pre-existing **layering violation**:
`todo.routes.ts` previously imported `CreateReq`/`UpdateReq` directly from `../models/todo`, bypassing the service
layer entirely (the operator's own stated rule: routes import services only, never models). It no longer imports
the model at all.

`passthrough = <T>(ctx, input: T) => Effect.succeed(input)` names the "just relay the input" controller body once.
**A real finding from the empirical verification, not assumed:** bare `run: passthrough` (no annotation) only
type-checks correctly when a controller's OWN `params`/`body` are declared locally — if the controller declares
neither (relying purely on bubbling from a service, `todo`'s actual pattern for every by-id route), `passthrough`'s
generic collapses to `void`, and — **before the soundness fix below** — this would have silently type-checked
anyway. `getTodo`/`createTodo`/`updateTodo`/`deleteTodo` therefore use the explicit `InputOf<typeof S.x>`
annotation; `getTodoDetail` uses bare `passthrough` since it DOES declare `params` locally. **A cleanup-completeness
finding, fixed here:** the first pass at this file left all 5 controllers writing `Effect.succeed(input)` by hand
instead of calling the very helper this change built to eliminate that — every controller now actually calls
`passthrough`.

## A real, pre-existing `sulukFmt` type-soundness bug, found and fixed

Verifying the above surfaced something more serious than a naming gap: **`sulukFmt`'s properly-typed 1/2/3-arg
overloads (`SulukFn<In,A,R1>, SulukFn<A,Out,R2> → SulukFn<In,Out,...>`, requiring adjacent stages' Out/In to unify)
could be silently bypassed.** The final overload, `sulukFmt(...fns: AnySulukFn[]): AnySulukFn` (`AnySulukFn =
SulukFn<any,any,any>`), matches ANY argument count — including 1, 2, and 3 — so whenever the properly-typed
overload FAILED to unify (a genuine mismatch between two composed stages), TypeScript didn't report that failure;
it silently fell through to the untyped catch-all instead, which accepts anything. **Confirmed via a deliberate
test**: composing a controller returning a completely wrong shape with a service expecting something else produced
**zero compile errors** before the fix.

Fixed by adding a properly-typed 4-arg overload and requiring the catch-all to have **5 explicit parameters** before
`...rest` — so it can never match a 1-4-arg call; those now MUST go through a properly-typed overload, and a real
mismatch is a real, visible `tsc` error (re-verified: the same deliberate-mismatch test now correctly fails to
compile). A 5+-stage pipeline remains an untyped escape hatch (same as any fixed-arity `pipe`/`compose`) — grepped
the entire repo (`tooling/ts/packages/*/src`, `*/test`, `registry/`) for a `sulukFmt` call with 5+ arguments: **none
exist**, so the residual gap is currently unreachable, not a live risk. This is arguably the single most
consequential fix in this change: without it, `params`/`InputOf` could be silently defeated by exactly the kind of
mismatch they exist to prevent, undermining the very "everything statically connected" goal that motivated C118.

## A shared `provide` helper

`registry/foundation/app/app.ts` now exports `provide = <X,E>(env, p) => p.pipe(Effect.provide(DbLive(env)))` — the
exact generic helper every route file was hand-declaring identically. `todo.routes.ts` imports it; no per-module
re-declaration of the same signature.

## Consequences

- `@suluk/effect` gains `params` (on `RequestSlice`/`sulukFn`), `MergedInput`, `InputOf`, `passthrough`, a 4-arg
  `sulukFmt` overload, and the 5-arg-minimum catch-all (the soundness fix). 0.14.2 → 0.15.0 (a real behavior
  change — the catch-all is stricter — flagged as feature/breaking-in-the-safe-direction, not patch).
- `registry/foundation/app/app.ts`: `queryOne`/`queryMany`/`mutate` gain `params`; a shared `provide` export.
- `registry/services/todo/{todo.model,todo.ops,todo.routes}.ts` rewritten around `params`/`InputOf`/`passthrough`;
  `todo.routes.ts` no longer imports the model layer at all (a real layering-violation fix).
- `tooling/ts/AUTHORING.md` and the `todo` module's `README.md` updated — the canonical example now shows the real,
  current pattern, not the pre-C118 manual-`ctx.param()` one.
- Full ecosystem sweep: zero fail, zero typecheck errors across 46 packages. A 5-reviewer adversarial pass found
  zero blockers; both real findings (unused `passthrough`, the merge-order hardening) are fixed and regression-tested.

Pairs with `plan/facts/0params-inputof-sulukfmt-soundness.bn`.
