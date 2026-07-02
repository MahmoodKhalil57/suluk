[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/nano-stores](../README.md) / AsyncBindOptions

# Interface: AsyncBindOptions

Defined in: [tooling/ts/packages/nano-stores/src/async-button.ts:8](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/nano-stores/src/async-button.ts#L8)

asyncHandler / bindAsyncButton — promise-aware double-submit safety as a primitive, so builders write a normal
async handler and get race-safety for free instead of hand-rolling `btn.disabled = true; try {...} finally {...}`
on every form (saastarter parity: "every async action auto-disables its trigger + shows pending"). Wraps a
handler so the element is disabled + aria-busy (+ an optional pending label) for the in-flight window and
restored on settle, with a re-entry guard. Framework-agnostic; works on any element-like with disabled/textContent.

## Properties

### ariaBusy?

> `optional` **ariaBusy?**: `boolean`

Defined in: [tooling/ts/packages/nano-stores/src/async-button.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/nano-stores/src/async-button.ts#L12)

set aria-busy="true" during the call (default true).

***

### pendingLabel?

> `optional` **pendingLabel?**: `string`

Defined in: [tooling/ts/packages/nano-stores/src/async-button.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/nano-stores/src/async-button.ts#L10)

text to show while in-flight (restored after).
