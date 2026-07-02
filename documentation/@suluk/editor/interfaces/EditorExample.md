[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/editor](../README.md) / EditorExample

# Interface: EditorExample

Defined in: [examples.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/editor/src/examples.ts#L11)

Seed documents the editor can open with. These are deliberately v4-NATIVE: the flagship "Suluk Galaxy" puts TWO
named requests on one path sharing the same HTTP method (`checkout` → guestCheckout + memberCheckout) — the headline
v4 capability that OpenAPI 3.1, which keys operations by method, cannot express. They also carry the v4 facets
(`x-suluk-cost`, `x-suluk-access`) so the preview's cost explorer + access lens + hardening grade light up.

`doc` is typed `unknown` on purpose: the v4 facets live as `x-suluk-*` members on requests, which the strict
Request type does not enumerate. The editor stringifies `doc` to JSON for the source pane; @suluk/core then
re-parses + validates it like any user input — so these are held to the same bar as a pasted document.

## Properties

### description?

> `optional` **description?**: `string`

Defined in: [examples.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/editor/src/examples.ts#L14)

***

### doc

> **doc**: `unknown`

Defined in: [examples.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/editor/src/examples.ts#L16)

A v4 document (or, for the upgrade demo, a 3.1 document). Parsed + validated like any user input.

***

### id

> **id**: `string`

Defined in: [examples.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/editor/src/examples.ts#L12)

***

### label

> **label**: `string`

Defined in: [examples.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/editor/src/examples.ts#L13)
