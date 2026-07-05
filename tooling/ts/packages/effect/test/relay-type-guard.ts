/**
 * Type-only regression coverage for `sulukFmt.relay`'s compile-time guard (C119) — not run by `bun test` (no
 * `.test.` in the filename, so bun's default discovery skips it), but IS typechecked by `tsc --noEmit -p .`
 * (this dir is in the package's `include`), so a regression here fails `bun run typecheck`, not silently.
 */
import { Effect } from "effect";
import { z } from "zod";
import { sulukFn, sulukFmt, view, type InputOf, type AnySulukFn } from "../src/index";

const concreteModel = sulukFn({
  params: z.object({ id: z.string() }),
  ok: { schema: z.object({ id: z.string(), title: z.string() }) },
  run: (_ctx, { id }) => Effect.succeed({ id, title: "x" }),
});
const concreteService = sulukFmt(concreteModel);

// a real, concrete service — relay must accept it with zero errors.
const okRelay = sulukFmt.relay(concreteService, { method: "get", path: "/api/items/:id", roles: ["signed-in"], view: view("item") });
type _AssertOkIn = InputOf<typeof okRelay> extends { id: string } ? true : never;
const _assertOkIn: _AssertOkIn = true;

// a sulukFmt.all fan-out — its In is deliberately `unknown`; relay must reject it at compile time.
const fanOut = sulukFmt.all({ item: concreteService, count: sulukFn({ ok: { schema: z.number() }, run: () => Effect.succeed(1) }) });
// @ts-expect-error - a fan-out's `In` is `unknown`; sulukFmt.relay must not silently accept it (C119 finding).
const fanOutRelay = sulukFmt.relay(fanOut, { method: "get", path: "/api/items/:id/detail" });

// a service reached through a widened AnySulukFn reference — In collapses to `any`; relay must reject this too.
const widened: AnySulukFn = concreteService;
// @ts-expect-error - a widened AnySulukFn's `In` is `any`; sulukFmt.relay must not silently accept it either.
const widenedRelay = sulukFmt.relay(widened, { method: "get", path: "/x" });

void okRelay; void _assertOkIn; void fanOutRelay; void widenedRelay;
