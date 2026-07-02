[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / defaultViewers

# Function: defaultViewers()

> **defaultViewers**(`doc`): [`Viewer`](../interfaces/Viewer.md)[]

Defined in: [cockpit/src/crosscut.ts:65](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/cockpit/src/crosscut.ts#L65)

Sensible default viewers for a document: anonymous, one per declared scope, and the full operator view —
so a single command shows the whole gated surface without the user hand-entering scope sets.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

## Returns

[`Viewer`](../interfaces/Viewer.md)[]
