# Types & Enums

## stores

### `ApiStores`
**Properties:**
- `fetchers: Record<string, FetcherFactory>` — name → factory that, given path params, yields a lazy fetcher store.
- `mutators: Record<string, MutatorInvoker>` — name → mutator store (POST/PUT/PATCH/DELETE/…).
- `ctx: { __unsafeOverruleSettings: (data: CommonSettings<unknown>) => void; invalidateKeys: (keySelector: KeySelector) => void; revalidateKeys: (keySelector: KeySelector) => void; mutateCache: (keySelector: KeySelector, data?: unknown) => void }` — The shared @nanostores/query context (invalidateKeys / revalidateKeys / mutateCache).
- `invalidate: (routeNameOrUrl: string) => void` — Convenience over ctx.invalidateKeys: invalidate by route NAME (its built URLs) or by a raw URL/prefix.
- `warnings: string[]` — Non-fatal projection losses (e.g. a GET with no response schema → unvalidated). Never thrown.

### `FetcherFactory`
A bound fetcher store factory: call with the route's path params to get a cache-keyed store.
```ts
(params?: Record<string, string | number>) => FetcherStore<unknown>
```

### `MutatorInvoker`
A bound mutator store: `.mutate({ data, params })` runs the (validated) request and returns the validated body.
```ts
MutatorStore<MutatorInput, unknown>
```

### `MutatorInput`
**Properties:**
- `data: unknown` (optional)
- `params: Record<string, string | number>` (optional)
- `action: string` (optional) — Overrides the store's default action for this call (the `x-suluk-action` cost-tracing tag).

## cart

### `CartStore`
**Properties:**
- `$items: MapStore<Record<string, CartLine>>` — lines keyed by an OPAQUE prefixed id — subscribe for reactive UI, but render from `lines()` (insertion
order) and look lines up with `get(productId)`. (Keys are prefixed so the JS engine preserves insertion
order even for numeric product ids, which it would otherwise hoist ahead of string ids.)
- `$count: ReadableAtom<number>` — total quantity across all lines.
- `$subtotalCents: ReadableAtom<number>` — Σ qty·priceCents — the cart subtotal in cents (pre-discount, pre-tax).

### `CartLine`
One cart line. The merge key is (`productId`, `variantId`) — two variants of one product are DISTINCT lines.
 `priceCents` is the unit price at add-time; `image`/`variantLabel` let the drawer + checkout render richly.
**Properties:**
- `productId: string | number`
- `variantId: string | number` (optional) — the selected variant, if any — part of the merge key so size/colour pick distinct lines.
- `qty: number`
- `priceCents: number`
- `name: string`
- `image: string` (optional) — the line's display image (the variant's, falling back to the product's) — for the cart drawer + checkout.
- `variantLabel: string` (optional) — a human label for the chosen variant (e.g. "Black / M") — shown under the name.

## discount

### `DiscountStore`
**Properties:**
- `$discount: ReadableAtom<AppliedDiscount | null>`

### `AppliedDiscount`
A validated, applied discount. `type`/`value` mirror @suluk/stripe's Discount so the money core can consume it.
**Properties:**
- `code: string`
- `type: "percent" | "fixed"`
- `value: number`
- `validatedAt: number` (optional) — epoch ms when it was validated — lets the app re-validate stale discounts.

## progress

### `ProgressBar`
**Properties:**
- `$value: ReadableAtom<number>` — 0 (idle) … 1 (complete). Subscribe to drive any renderer.

### `ProgressElement`
**Properties:**
- `style: { width: string }`
- `classList: { toggle: any }`

## drawer

### `Drawer`

### `PanelEl`
createDrawer — the reusable open/close controller behind any slide-in panel (cart, mobile nav, a Sheet): toggles
the panel + backdrop visibility and an `open` class (for the CSS transition), makes the page chrome `inert` while
open (a real focus-trap + AT hide — honoring aria-modal), closes on Escape + backdrop click, and restores focus on
close. Framework-agnostic; the look + the RTL-aware slide direction live in CSS. Timing is injectable so the
open/close state machine is unit-testable without a real DOM.
**Properties:**
- `hidden: boolean`
- `classList: { add: any; remove: any }`

## validation

### `FieldLike`
Form-error feedback primitives (saastarter parity: "invalid fields ring red + shake", "errors clear as you type").
Framework-agnostic — they toggle the SEMANTIC contract (aria-invalid + the .shake class); the LOOK is `@suluk/theme`
base CSS ([aria-invalid] destructive ring + `@keyframes` shake). So a hand-written form gets accessible, animated
validation feedback without a component framework.
**Properties:**
- `classList: { add: any; remove: any }` (optional)
