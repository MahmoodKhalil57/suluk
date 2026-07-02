---
description: "v4 'Suluk' contracts -> typed Nano Stores client: per-operation fetcher/mutator stores (@nanostores/query) with Zod-validated I/O. CANDIDATE tooling."
name: suluk-nano-stores
---

# @suluk/nano-stores

v4 'Suluk' contracts -> typed Nano Stores client: per-operation fetcher/mutator stores (@nanostores/query) with Zod-validated I/O. CANDIDATE tooling.

## Quick Start

```ts
import { createApiStores } from "@suluk/nano-stores";
import { keepMount, allTasks } from "nanostores";
import { z } from "zod";
import type { RouteContract } from "@suluk/hono";

const Pet = z.object({ id: z.number(), name: z.string() });

const routes: RouteContract[] = [
  { method: "get",  path: "/pet/:petId", name: "getPet",    request: { params: z.object({ petId: z.string() }) }, responses: [{ status: 200, schema: Pet }] },
  { method: "post", path: "/pet",        name: "createPet", request: { json: z.object({ name: z.string() }) },    responses: [{ status: 200, schema: Pet }] },
];

const api = createApiStores(routes, {
  baseUrl: "https://api.example.com",
  action: "pets-page", // → x-suluk-action on every request (cost tracing)
});

// --- a MUTATOR (POST/PUT/PATCH/DELETE) ---
// body validated against request.json BEFORE the call; response validated against the 2xx schema.
// `.mutate` resolves to the validated body, or REJECTS with a SchemaViolationError.
const pet = await api.mutators.createPet.mutate({
  data: { name: "Rex" },
  action: "create-button", // per-call action overrides the store default
});

// --- a FETCHER (GET) ---  lazy: it fetches once mounted.
const store = api.fetchers.getPet({ petId: "99" });
keepMount(store);
await allTasks();
store.get().data;  // → { id: 99, name: "Fido" } (validated), or .error on schema drift

// invalidate by route name (refetches its mounted stores) or by raw URL/prefix.
api.invalidate("getPet");

// non-fatal projection losses (e.g. a GET with no response schema → unvalidated).
api.warnings; // string[], never thrown
```

## Configuration

7 configuration interfaces — see references/config.md for details.

## Quick Reference

**url:** `buildUrl` (URL templating for the STATE corner)
**stores:** `createApiStores`, `SchemaViolationError` (A validation failure on either edge — carries the Zod issues so callers can surface what drifted), `ApiStores`, `FetcherFactory` (A bound fetcher store factory: call with the route's path params to get a cache-keyed store), `MutatorInvoker` (A bound mutator store: `), `MutatorInput`
**cart:** `createCartStore`, `CartStore`, `CartLine` (One cart line)
**discount:** `createDiscountStore`, `DiscountStore`, `AppliedDiscount` (A validated, applied discount)
**async-button:** `asyncHandler` (Wrap an async (or sync) handler with auto-disable + aria-busy + optional pending label + re-entry guard), `bindAsyncButton` (Convenience: attach an auto-pending async handler to an element's event (default "click"))
**progress:** `createProgressBar`, `ProgressBar`, `ProgressElement`
**reveal:** `revealOnScroll` (Start revealing; returns a cleanup that disconnects the observer)
**drawer:** `createDrawer`, `Drawer`, `PanelEl` (createDrawer — the reusable open/close controller behind any slide-in panel (cart, mobile nav, a Sheet): toggles
the panel + backdrop visibility and an `open` class (for the CSS transition), makes the page chrome `inert` while
open (a real focus-trap + AT hide — honoring aria-modal), closes on Escape + backdrop click, and restores focus on
close)
**validation:** `markInvalid` (Mark a field invalid: aria-invalid="true" (the theme rings it red) + a brief shake), `clearInvalid` (Clear a field's invalid state), `clearInvalidOnInput` (Attach real-time clearing: editing a field clears its invalid state (so the red ring disappears as the user fixes
 it, instead of lingering until the next submit)), `FieldLike` (Form-error feedback primitives (saastarter parity: "invalid fields ring red + shake", "errors clear as you type"))

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When using a class → read `references/classes.md` for properties, methods, and inheritance
- When defining typed variables or function parameters → read `references/types.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)