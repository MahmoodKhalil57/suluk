# C119 — `sulukFmt.relay`: the LAST manually-maintained type in a route, inferred from the service itself

> **Provenance.** A Suluk *candidate* decision (codename `asl-ojs`), authored by the single contributor, grounded in
> burhan/daftar/mizan — **not** a Moonwalk SIG decision. Operator-driven (2026-07-05), a direct, immediate follow-on
> to C118, pointing at the exact line C118 left standing: *"we should find a way to not have to maintain this
> separate type, it should be inferred from the services that will run directly automatically using generics
> etc.."* — citing `InputOf<typeof S.getTodo>` in `registry/services/todo/todo.routes.ts`.

**Status:** BUILT + VERIFIED. `@suluk/effect` **169/169** tests pass (6 new, one of them a runtime regression test;
plus a permanent type-only regression file checked by `tsc`, not `bun test`). Full 46-package sweep: zero fail,
zero typecheck errors. An independent adversarial workflow (skeptical review → verify-each-finding-from-scratch)
surfaced 4 real findings; the 2 substantive ones are fixed below, the other 2 are judged genuine-but-acceptable
design tradeoffs.

## The gap C118 left open

C118 gave a controller `InputOf<Fn>` — extract a composed service's own input type instead of re-importing the
model's schema. But the controller's `run` still had to **name** that extraction at every call site:

```ts
run: (ctx, input: InputOf<typeof S.getTodo>) => passthrough(ctx, input),
```

`InputOf<typeof S.getTodo>` is itself a small, manually-restated fact — correct today, but nothing stops it from
drifting (copy-pasted to the wrong service, or left stale after a refactor) since nothing checks that the
annotation matches the SAME service the controller is actually composed with two lines later.

## `sulukFmt.relay(service, meta)`

```ts
export namespace sulukFmt {
  export function relay<Fn extends AnySulukFn>(service: Fn & RejectUnknownInput<Fn>, meta: RelayMeta): SulukFn<InputOf<Fn>, OutputOf<Fn>, ReqOf<Fn>> {
    const { method, path, name, summary, description, tags, roles, scope, scopes, internal, ok, view, step } = meta;
    const controller = sulukFn<void, void, InputOf<Fn>, InputOf<Fn>, never>({ ...picked, run: passthrough });
    return sulukFmt(controller, service as Fn);
  }
}
```

`relay` takes the **service** as its first argument — the ONE place the type actually lives — and TypeScript
infers `In`/`Out`/`R` from the concrete VALUE passed, not from a name the developer has to spell. `registry/
services/todo/todo.routes.ts`'s 4 direct-relay routes are now:

```ts
const getTodo = sulukFmt.relay(S.getTodo, {
  method: "get", path: "/api/todos/:id", name: "getTodo", roles: ["signed-in"],
  summary: "Get one of the signed-in user's todos by id.", view: view("todo"),
  step: [{ role: "when", text: "they open a todo by id" }, { role: "then", text: "the todo is returned" }],
});
```

Zero `InputOf`, zero `z.infer`, zero import of the model. `listTodos` (extracts `ctx.c.req.query()` — not a
merged-input relay) and `getTodoDetail` (a `sulukFmt.all` fan-out — see below) are unchanged; `relay` is
specifically the "just forward the input" shape, which is exactly what the other 4 routes are.

**Verified, not assumed, that the generic inference produces real types**: a throwaway compile check used a
from-scratch, any-leak-detecting `Equal`/`IsAny` type helper (validated non-vacuous via a `@ts-expect-error`
negative control) to prove `InputOf<typeof relay(...)>` is the REAL concrete type, not `any`, across params-only /
body-only / both, with no cross-call contamination between separate `relay` invocations in the same module.

## Two real findings from an independent adversarial workflow, both fixed

An independent workflow (skeptical review pass, then a from-scratch verify-agent per finding, none reusing the
author's scratch files) surfaced 4 findings. Two were judged genuine design tradeoffs (below); two were real gaps,
fixed here:

**1. A widened `AnySulukFn` reference, or a `sulukFmt.all` fan-out, silently type-checked with a wrong/absent
input type.** `Fn extends AnySulukFn` structurally accepts a fan-out (`SulukFn<unknown, P, R>`, since fan-out's
`In` is deliberately `unknown` — it can't bubble a shared `params`/`body`) with **zero compile error**, producing
a route with NO request schema at all that **throws an unhandled TypeError at the first real request** instead of
the typed 400 the framework otherwise guarantees. The same structural hole let a service reached through an
`AnySulukFn`-typed variable silently collapse `InputOf`/`OutputOf` to `any` — the exact "nothing to keep in sync"
guarantee `relay` exists to provide, quietly not holding.

**Fixed** by a compile-time guard: `IsUnknownOrAny<T> = [T] extends [unknown] ? ([unknown] extends [T] ? true : false) : false`
detects both `unknown` (fan-out) and `any` (widened reference) in one mechanism (verified: a concrete type
correctly reads `false`); `RejectUnknownInput<Fn>` collapses `Fn`'s parameter position to a literal STRING error
message when it fires, so the failure reads as a message at the call site, not a bare mismatch. Verified via a
**permanent** type-only regression file (`test/relay-type-guard.ts` — not `.test.ts`, so `bun test` skips it, but
`tsc --noEmit -p .` still checks it, since `test/` is in the package's `include`): a concrete service compiles
clean; a `sulukFmt.all` fan-out and a widened `AnySulukFn` reference are BOTH gated behind `@ts-expect-error`
(confirmed non-vacuous — an unused directive is itself a `tsc` error, and there were none).

**2. `meta`'s forbidden fields (`params`/`body`/`cost`/`errors`/…) were silently APPLIED, not just undocumented,
when routed through a variable instead of an inline literal** — TypeScript's excess-property check only fires on
object LITERALS; a `meta` built via a shared helper (a natural thing to do, given this codebase's own
anti-duplication discipline) carrying a stray `cost`/`params` field would have overridden the service's REAL,
enforced schema/cost via `sulukFmt`'s own-wins-first merge, with no compile error and no crash — just silently
wrong behavior. **Fixed** by destructuring exactly `RelayMeta`'s own fields inside `relay` rather than spreading
the whole `meta` object — a real, unconditional runtime whitelist, not reliant on TypeScript catching it. Verified
via a new runtime test: a `Record<string, unknown>`-typed `meta` smuggling a wrong `params` schema and a phantom
cost entry is proven inert — the relayed route still carries the SERVICE's real `params`/`cost`, never the
smuggled ones.

## Two findings judged genuine, acceptable tradeoffs — not fixed

- **The `sulukFmt.relay(service, meta)` vs `sulukFmt(controller, service)` argument-order asymmetry** (`relay`
  takes the value it infers from FIRST; the base combinator takes the controller first) is inherent to why `relay`
  exists — you cannot move `meta` first, since `meta` carries no type information to infer `Fn` from. `relay`'s own
  JSDoc already states this rationale; the operator's own C117/C118 directive ("remove all comments... function
  names should be intuitive enough") argues against adding a second, per-call-site comment in `todo.routes.ts`
  restating what `relay`'s doc comment already explains once, at the definition.
- **`relay`'s constraint doesn't (and structurally can't) reject a wrong-but-concrete service** — that soundness
  is already `sulukFmt`'s own job (C118's overload-arity fix), which `relay` delegates to via its final
  `sulukFmt(controller, service)` call; duplicating that check inside `relay` itself would be the same logic twice.

## Consequences

- `@suluk/effect` gains `sulukFmt.relay`, `RelayMeta`, `OutputOf<Fn>` (mirrors the existing private `OutOf`,
  exported since `relay`'s callers may want to name it), and two private helpers (`IsUnknownOrAny`,
  `RejectUnknownInput`) backing the compile-time guard. 0.15.0 → 0.16.0 (new API surface).
- `registry/services/todo/todo.routes.ts`: `getTodo`/`createTodo`/`updateTodo`/`deleteTodo` rewritten via
  `sulukFmt.relay`; zero `InputOf`/`z.infer`/model imports remain in the file. `listTodos`/`getTodoDetail`
  unchanged (neither fits `relay`'s shape, for stated structural reasons).
- Full ecosystem sweep: zero fail, zero typecheck errors across 46 packages. `@suluk/effect` 169/169 tests (6 new).
  A scratch-package live-HTTP + doc-emission re-verification, re-run AFTER the guard/whitelist hardening, confirms
  behavior and the emitted OpenAPI doc are unchanged from the pre-C119 manual-`InputOf` version.

Pairs with `plan/facts/0sulukfmt-relay.bn`.
