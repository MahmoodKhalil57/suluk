<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

<h1 align="center">@suluk/nano-stores</h1>

<p align="center"><b>One v4 contract → a typed Nano Stores client: per-operation fetcher/mutator stores with Zod-validated I/O, plus framework-agnostic cart, drawer and felt-UX primitives.</b></p>

<p align="center">
  <em>Part of <a href="https://github.com/MahmoodKhalil57/suluk">Suluk</a> — one typed OpenAPI v4 contract projecting into every full-stack layer.</em>
</p>

---

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/nano-stores
```

Peer deps: `nanostores`, `@nanostores/query`, and `zod` (v4).

## What it does

The **STATE corner** of the Suluk suite. It takes the same v4 `RouteContract[]` that `@suluk/hono`
derives a *server* from, and projects them into a typed [Nano Stores](https://github.com/nanostores/nanostores)
*client* — one source of truth, two projections.

- **`createApiStores(routes)`** — GET routes become `@nanostores/query` **fetcher** stores (lazy,
  cache-keyed, revalidatable); everything else becomes a **mutator** store.
- **Zod guards both edges.** Request bodies are validated against the contract's `request.json`
  *before* the network call (fail fast, no bad write); responses are validated against the route's
  2xx schema *after* parsing (reject on drift). A violation rejects with a typed `SchemaViolationError`
  carrying the Zod issues — never swallowed.
- **Cost tracing built in.** Every request carries an `x-suluk-action` header so the server's cost
  meter (`@suluk/cost`) can attribute spend back to the UI action that triggered it.
- **Commerce + felt-UX primitives.** A localStorage-persisted, cross-tab-synced **cart** and
  **discount** store, plus vanilla DOM helpers — a slide-in **drawer**, a nav **progress bar**,
  **scroll-reveal**, **async-button** double-submit safety, and form-**validation** feedback. All
  framework-agnostic (no React) and usable from a plain `<script>`, an Astro island, Svelte/Vue, or a worker.

## When to reach for it

- You have a Suluk/Hono v4 contract and want a **typed, validated client store layer** for a
  nanostores frontend — without hand-writing fetchers or re-deriving request/response types.
- You want a **drop-in shopping cart / discount store** that persists and syncs across tabs, and the
  small interaction primitives a polished MPA shell needs (drawer, nav progress, reveal, async buttons).

Not this package when: you want a generated *typed SDK* (request functions, not stores) — reach for
`@suluk/sdk`. You want generated React form/table components — `@suluk/shadcn`. You want an admin UI
projected from the contract — `@suluk/panel`.

## Usage

### The contract → stores projection (`createApiStores`)

Hand it your v4 `RouteContract[]` (the array `@suluk/hono` also consumes). GET → fetcher factories,
the rest → mutator stores, keyed by each route's derived name.

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

`SchemaViolationError` carries `.side` (`"request"` | `"response"`), `.route`, and `.issues`:

```ts
import { SchemaViolationError } from "@suluk/nano-stores";

try {
  await api.mutators.createPet.mutate({ data: { name: 123 as never } });
} catch (e) {
  if (e instanceof SchemaViolationError) console.error(e.side, e.issues); // "request", [...]
}
```

### Cart + discount stores

Vanilla Nano Stores, no framework. Persists to `localStorage` as the de-facto `[{ productId, qty,
priceCents, name }]` array, and stays consistent across tabs (native `storage` event) and within a
tab (a custom change event), so a starter that already writes the same key by hand can adopt it
incrementally.

```ts
import { createCartStore, createDiscountStore } from "@suluk/nano-stores";

const cart = createCartStore({ storageKey: "cart" });

cart.add({ productId: "p1", qty: 1, priceCents: 1000, name: "Widget" });
cart.add({ productId: "p1", qty: 2 } as any);  // same productId → merges (qty = 3)
cart.setQty("p1", 5);                            // qty <= 0 removes the line
cart.lines();                                    // CartLine[] in insertion order — the render source

cart.$count.subscribe((n) => updateBadge(n));    // total quantity (ReadableAtom)
cart.$subtotalCents.get();                        // Σ qty·priceCents (pre-discount)

// the cart's companion — the app validates the code, the store persists the result:
const discount = createDiscountStore({ storageKey: "discount" });
discount.apply({ code: "SAVE10", type: "percent", value: 10 }); // mirrors @suluk/stripe's Discount shape
discount.get(); // → { code, type, value, validatedAt? } | null
```

### Interaction primitives (framework-agnostic DOM)

The "felt-UX" helpers — pure DOM, the *look* lives in `@suluk/theme`'s base CSS.

```ts
import { createDrawer, createProgressBar, revealOnScroll, bindAsyncButton, markInvalid } from "@suluk/nano-stores";

// slide-in panel (cart / mobile nav): open/close + inert focus-trap + focus restore.
const d = createDrawer({
  drawer: panelEl,
  backdrop: backdropEl,
  inertTargets: () => [header, main, footer], // made inert while open
  initialFocus: () => closeButton,
});
d.open();  d.toggle();  d.isOpen();

// asymptotic nav progress bar — the store owns the value, you drive the cadence.
const p = createProgressBar({ el: bar });
p.start();
const iv = setInterval(() => p.tick(), 140); // eases fast, then crawls toward 95%
// on navigation complete:
clearInterval(iv); p.done();

// staggered scroll-reveal of [data-reveal] elements (degrades to reveal-all without IntersectionObserver).
const stop = revealOnScroll();

// promise-aware double-submit safety: auto-disables + aria-busy + optional pending label.
bindAsyncButton(submitBtn, async () => { await saveForm(); }, { pendingLabel: "Saving…" });

// form-error feedback: aria-invalid ring + shake (the theme supplies the CSS).
markInvalid(emailField, { shake: true });
```

## API

| Export | Kind | What it does |
|---|---|---|
| `createApiStores(routes, opts?)` | fn → `ApiStores` | Project `RouteContract[]` into `fetchers`, `mutators`, `invalidate`, `warnings`, and the shared query `ctx`. |
| `SchemaViolationError` | class | Thrown/rejected on a request- or response-edge schema violation; carries `side`, `route`, `issues`. |
| `buildUrl(path, params?, baseUrl?)` | fn | Substitute `:name` (Hono) **and** `{name}` (RFC-6570 / v4) path params; unbound placeholders left verbatim (honest loss). |
| `createCartStore(opts?)` | fn → `CartStore` | Persisted, cross/same-tab-synced cart; `$items` / `$count` / `$subtotalCents` + `add` / `setQty` / `remove` / `clear`. |
| `createDiscountStore(opts?)` | fn → `DiscountStore` | Persisted applied-discount atom (`$discount`, `apply`, `clear`). |
| `createDrawer(opts)` | fn → `Drawer` | Slide-in panel controller: open/close/toggle + inert focus-trap + focus restore. |
| `createProgressBar(opts?)` | fn → `ProgressBar` | Asymptotic nav progress (`start` / `tick` / `done` / `reset` / `set`); store owns the value. |
| `revealOnScroll(opts?)` | fn → cleanup | Staggered IntersectionObserver reveal for `[data-reveal]`; reveal-all fallback. |
| `asyncHandler` / `bindAsyncButton` | fn | Wrap/attach a promise-aware handler with auto-disable + aria-busy + re-entry guard. |
| `markInvalid` / `clearInvalid` / `clearInvalidOnInput` | fn | Form-field error feedback (aria-invalid + shake) and real-time clearing. |

All types (`ApiStores`, `CreateApiStoresOptions`, `MutatorInput`, `CartStore`, `CartLine`,
`DiscountStore`, `AppliedDiscount`, `Drawer`, `ProgressBar`, `RevealOptions`, `AsyncBindOptions`,
`FieldLike`, …) are exported alongside their factories.

## Boundary

The **L3 line — render/generate, never host.** This package hands you stores you own and call; it
never becomes a runtime your app has to phone home to. The seams stay app-side:

- **Inject the network.** `createApiStores` takes a `fetch` (defaults to global) and a `baseUrl` — the
  store layer is the projection, the transport is yours.
- **Inject persistence + events.** The cart/discount stores take a `storage` and `events` target
  (default `localStorage` / `globalThis`, in-memory shim under SSR/build/tests). Pass `null` to disable
  syncing, or a mock to test headless.
- **Server-authoritative logic stays in the contract.** Checkout, discount *validation*, and final
  totals are `createApiStores` mutators against your endpoints — the cart store owns only the
  optimistic client cart and reconciles from the server response. The interaction primitives toggle
  semantic state (`aria-busy`, `aria-invalid`, an `open` class); the visuals are `@suluk/theme` CSS.

## License

Apache-2.0
