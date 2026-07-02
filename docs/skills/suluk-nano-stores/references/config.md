# Configuration

## CreateApiStoresOptions

### Properties

#### baseUrl

Prepended to every built URL (e.g. "https://api.example.com").

**Type:** `string`

#### fetch

Injected fetch — defaults to the global. Tests pass a recording mock.

**Type:** `typeof fetch`

#### action

The current frontend ACTION (a button-click id), sent as `x-suluk-action` on every request so the
server's cost meter (@suluk/cost) can attribute cost back to the UI action. A function lets it reflect
the live action. A per-call action on `.mutate({ action })` overrides it.

**Type:** `string | (() => string | undefined)`

## CartStoreOptions

### Properties

#### storageKey

localStorage key (default "cart").

**Type:** `string`

#### storage

Persistence backend. Defaults to `globalThis.localStorage` when present, else an in-memory shim (so the
store is usable in SSR/build/tests without throwing). Pass a mock in tests.

**Type:** `Pick<Storage, "getItem" | "setItem"> | null`

#### events

Event target for cross-tab + same-tab sync (default `globalThis`). The store LISTENS for the native
`storage` event (fires in OTHER tabs) and for `changeEvent` (same tab). Pass `null` to disable syncing.

**Type:** `Pick<EventTarget, "addEventListener" | "removeEventListener" | "dispatchEvent"> | null`

#### changeEvent

Same-tab change-notification event name (default "cart-changed"). Non-store writers that mutate the same
localStorage key by hand should `dispatchEvent(new Event(changeEvent))` after writing, so the store (and the
UI it drives) refresh without a reload — the native `storage` event does NOT fire in the writing tab.

**Type:** `string`

## DiscountStoreOptions

### Properties

#### storageKey

localStorage key (default "discount").

**Type:** `string`

#### storage

persistence backend (default globalThis.localStorage, else in-memory; null → in-memory).

**Type:** `Pick<Storage, "getItem" | "setItem" | "removeItem"> | null`

#### events

sync event target (default globalThis; null disables).

**Type:** `Pick<EventTarget, "addEventListener" | "removeEventListener" | "dispatchEvent"> | null`

#### changeEvent

same-tab change-event name (default "discount-changed").

**Type:** `string`

## AsyncBindOptions

asyncHandler / bindAsyncButton — promise-aware double-submit safety as a primitive, so builders write a normal
async handler and get race-safety for free instead of hand-rolling `btn.disabled = true; try {...} finally {...}`
on every form (saastarter parity: "every async action auto-disables its trigger + shows pending"). Wraps a
handler so the element is disabled + aria-busy (+ an optional pending label) for the in-flight window and
restored on settle, with a re-entry guard. Framework-agnostic; works on any element-like with disabled/textContent.

### Properties

#### pendingLabel

text to show while in-flight (restored after).

**Type:** `string`

#### ariaBusy

set aria-busy="true" during the call (default true).

**Type:** `boolean`

## ProgressBarOptions

### Properties

#### el

element to paint (its style.width = value% and toggles `.active` while 0<v<1).

**Type:** `ProgressElement | null`

## RevealOptions

revealOnScroll — staggered scroll-triggered reveal for lists as a framework-agnostic primitive (saastarter parity:
"list items fade/slide in as they enter the viewport, staggered"). One IntersectionObserver toggles the reveal
class on `[data-reveal]` elements as they enter view; the look (initial hidden + transition + the `--i` stagger
delay) is @suluk/theme base CSS. Degrades gracefully: with no IntersectionObserver (SSR/old) it reveals everything
immediately, and reduced-motion is handled by the CSS, so content is NEVER stuck hidden.

### Properties

#### selector

elements to reveal (default "[data-reveal]").

**Type:** `string`

#### revealedClass

class added on reveal (default "reveal-in").

**Type:** `string`

#### root

query root (default document).

**Type:** `{ querySelectorAll: any } | null`

#### observer

injectable IntersectionObserver ctor (default global; absent → reveal-all fallback).

**Type:** `{ (callback: IntersectionObserverCallback, options?: IntersectionObserverInit): IntersectionObserver; prototype: IntersectionObserver }`

#### stagger

set `--i` (index, capped) on each element for the CSS stagger (default true).

**Type:** `boolean`

#### staggerCap

max stagger index before wrapping (default 12).

**Type:** `number`

## DrawerOptions

### Properties

#### drawer

the sliding panel.

**Type:** `PanelEl`

**Required:** yes

#### backdrop

the dimming backdrop (clicking it closes).

**Type:** `PanelEl | null`

#### openClass

class toggled for the open transition (default "open").

**Type:** `string`

#### hideDelayMs

ms to wait before hard-hiding on close (matches the CSS transition; default 220).

**Type:** `number`

#### inertTargets

page-chrome elements to make `inert` while open (focus-trap + AT hide).

**Type:** `() => { inert: boolean }[]`

#### initialFocus

element to focus on open (e.g. the close button).

**Type:** `() => { focus: any } | null | undefined`

#### onOpen

called on open / close (e.g. cart.reload() before showing).

**Type:** `() => void`

#### onClose

**Type:** `() => void`

#### raf

injectables (default the globals) — tests pass sync stand-ins.

**Type:** `(fn: () => void) => void`

#### setHideTimer

**Type:** `(fn: () => void, ms: number) => void`