# Functions

## url

### `buildUrl`
URL templating for the STATE corner. A RouteContract.path is Hono-style ("/pet/:petId"); v4 uriTemplates
are RFC-6570 ("pet/{petId}"). buildUrl accepts BOTH param syntaxes so the same helper works whether the
caller hands us a raw contract path or an already-projected v4 template — we substitute ":name" and
"{name}" segments from the params bag, then prepend an optional baseUrl.

Honest-loss discipline (house pattern): a placeholder with no matching param is NOT silently emptied — it
is left verbatim in the URL so the missing binding is visible in the request (and to any test asserting on
the URL), rather than producing a plausible-but-wrong path. Callers that want strictness can diff the
result against a "no `:`/`{` remains" check.
```ts
buildUrl(path: string, params?: Record<string, string | number>, baseUrl?: string): string
```
**Parameters:**
- `path: string`
- `params: Record<string, string | number>` (optional)
- `baseUrl: string` (optional)
**Returns:** `string`

## stores

### `createApiStores`
```ts
createApiStores(routes: readonly RouteContract[], opts: CreateApiStoresOptions): ApiStores
```
**Parameters:**
- `routes: readonly RouteContract[]`
- `opts: CreateApiStoresOptions` — default: `{}`
**Returns:** `ApiStores`

## cart

### `createCartStore`
```ts
createCartStore(opts: CartStoreOptions): CartStore
```
**Parameters:**
- `opts: CartStoreOptions` — default: `{}`
**Returns:** `CartStore`

## discount

### `createDiscountStore`
```ts
createDiscountStore(opts: DiscountStoreOptions): DiscountStore
```
**Parameters:**
- `opts: DiscountStoreOptions` — default: `{}`
**Returns:** `DiscountStore`

## async-button

### `asyncHandler`
Wrap an async (or sync) handler with auto-disable + aria-busy + optional pending label + re-entry guard. Returns
 the wrapped handler — attach it yourself (composes with addEventListener / onClick).
```ts
asyncHandler<E>(el: ElementLike, handler: (e: E) => unknown, opts: AsyncBindOptions): (e: E) => Promise<void>
```
**Parameters:**
- `el: ElementLike`
- `handler: (e: E) => unknown`
- `opts: AsyncBindOptions` — default: `{}`
**Returns:** `(e: E) => Promise<void>`

### `bindAsyncButton`
Convenience: attach an auto-pending async handler to an element's event (default "click").
```ts
bindAsyncButton<E>(el: ElementLike & { addEventListener: any }, handler: (e: E) => unknown, opts: AsyncBindOptions & { event?: string }): void
```
**Parameters:**
- `el: ElementLike & { addEventListener: any }`
- `handler: (e: E) => unknown`
- `opts: AsyncBindOptions & { event?: string }` — default: `{}`

## progress

### `createProgressBar`
```ts
createProgressBar(opts: ProgressBarOptions): ProgressBar
```
**Parameters:**
- `opts: ProgressBarOptions` — default: `{}`
**Returns:** `ProgressBar`

## reveal

### `revealOnScroll`
Start revealing; returns a cleanup that disconnects the observer.
```ts
revealOnScroll(opts: RevealOptions): () => void
```
**Parameters:**
- `opts: RevealOptions` — default: `{}`
**Returns:** `() => void`

## drawer

### `createDrawer`
```ts
createDrawer(opts: DrawerOptions): Drawer
```
**Parameters:**
- `opts: DrawerOptions`
**Returns:** `Drawer`

## validation

### `markInvalid`
Mark a field invalid: aria-invalid="true" (the theme rings it red) + a brief shake.
```ts
markInvalid(field: FieldLike, opts: { shake?: boolean; shakeMs?: number; setTimer?: (fn: () => void, ms: number) => void }): void
```
**Parameters:**
- `field: FieldLike`
- `opts: { shake?: boolean; shakeMs?: number; setTimer?: (fn: () => void, ms: number) => void }` — default: `{}`

### `clearInvalid`
Clear a field's invalid state.
```ts
clearInvalid(field: FieldLike): void
```
**Parameters:**
- `field: FieldLike`

### `clearInvalidOnInput`
Attach real-time clearing: editing a field clears its invalid state (so the red ring disappears as the user fixes
 it, instead of lingering until the next submit). Returns a cleanup.
```ts
clearInvalidOnInput(form: { addEventListener: any; removeEventListener?: any }): () => void
```
**Parameters:**
- `form: { addEventListener: any; removeEventListener?: any }`
**Returns:** `() => void`
