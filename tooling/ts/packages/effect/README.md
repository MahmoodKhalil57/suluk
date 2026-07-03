# @suluk/effect

**Effect-native routes whose v4 contract responses are DERIVED from the handler's types.** Stop returning generic
`ProblemDetails` for every error and hardcoding `200` — let the Effect error channel and the success type bubble up.

## The two problems it solves

1. **Detailed error types, not generic ProblemDetails.** Define errors as typed Effect `Data.TaggedError`s carrying their
   HTTP status + a body schema. A route lists the errors it can produce; each becomes a **distinct, typed response** (its own
   status + schema) in the emitted v4 document. Because Effect **unions the error channel automatically** as you compose
   functions, the set of errors a route can produce *is* its `E` type — and `effectRoute`'s signature **type-enforces** that
   every declared error matches: you can't under-declare the ways it throws.

2. **Success status inference, not a hardcoded 200.** The success status is derived from the method (`POST`→201, `DELETE`→204,
   else 200), overridable per route, and per-request via `respond()` / `Created()` / … — so it reflects the semantics.

## Usage

```ts
import { Effect } from "effect";
import { z } from "zod";
import { httpError, effectRoute } from "@suluk/effect";

// a typed error: its HTTP status + the ACTUAL body shape the caller receives
const InsufficientCredits = httpError("InsufficientCredits", 402, z.object({ required: z.number(), balance: z.number() }));

const { contract, handler } = effectRoute({
  method: "post", path: "/api/credits/debit", name: "debitCredits", scopes: ["credits:write"],
  ok: { schema: z.object({ ok: z.literal(true) }) },   // 201 by convention (POST); override with ok.status
  errors: [InsufficientCredits],                        // → a typed 402 response { required, balance }
  run: (c) =>
    Effect.gen(function* () {
      const { userId, amount } = yield* readBody(c);
      const ok = yield* Credits.debit(userId, amount);  // a service that fails with InsufficientCredits → bubbles to E
      if (!ok) return yield* new InsufficientCredits({ required: amount, balance: yield* Credits.balance(userId) });
      return { ok: true as const };
    }),
});

// spread `contract` into your route list (emitV4 / Scalar / SDK now show the typed 402, not ProblemDetails);
// mount `handler` at post /api/credits/debit.
```

- **`run` fails only with the declared errors** — `Effect<Body, InstanceType<errors[number]>, never>`. Declaring fewer than
  the code throws is a **type error** (the error channel is exact). The `never` requirement means the handler is fully
  provided (`Effect.provide(...)` your layers before returning).
- A **defect** (`Effect.die`, an unexpected throw) → a 500 `ProblemDetails`, surfaced not swallowed — a handler can always die.
- The runtime maps a tagged failure to **its** status + its typed body (exactly the error's schema fields).

## What emitV4 produces

The route's `responses` carry the success + one typed response per error, so the v4 document (and everything derived from it —
Scalar, the SDK, testgen) shows the **actual** error shapes. The always-synthesized `500` (and `401`/`403` for scoped ops) stay
generic `ProblemDetails` — those are the failure modes any handler shares.

Peer deps: `effect` ^3, `hono` ^4, `zod` ^4. CANDIDATE tooling.
