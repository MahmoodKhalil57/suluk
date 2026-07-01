[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/visual](../README.md) / PrimitiveSources

# Interface: PrimitiveSources

Defined in: [shadcn.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/visual/src/shadcn.ts#L10)

## Properties

### formLayout?

> `optional` **formLayout?**: `string`

Defined in: [shadcn.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/visual/src/shadcn.ts#L14)

The form renderer/layout source — so changing the form's arrangement re-verifies the composition.

***

### tableLayout?

> `optional` **tableLayout?**: `string`

Defined in: [shadcn.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/visual/src/shadcn.ts#L16)

The table renderer/layout source.

***

### widgets

> **widgets**: `Record`\<`string`, `string`\>

Defined in: [shadcn.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/visual/src/shadcn.ts#L12)

widget name (text/number/select/switch/…) → the source of its UI component (the bytes that draw pixels).
