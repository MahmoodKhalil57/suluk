[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / ComponentReport

# Interface: ComponentReport

Defined in: [cockpit/src/visual.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cockpit/src/visual.ts#L36)

## Properties

### confidence

> **confidence**: [`ConfidenceReport`](../../visual/interfaces/ConfidenceReport.md)

Defined in: [cockpit/src/visual.ts:39](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cockpit/src/visual.ts#L39)

***

### coverage

> **coverage**: `number`

Defined in: [cockpit/src/visual.ts:41](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cockpit/src/visual.ts#L41)

0..1 — fraction of used primitives that are approved + unchanged

***

### entities

> **entities**: `object`[]

Defined in: [cockpit/src/visual.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cockpit/src/visual.ts#L45)

which primitives each entity's form/table is built from

#### form

> **form**: `string`[]

#### name

> **name**: `string`

#### table

> **table**: `string`[]

***

### preview

> **preview**: `Record`\<`string`, `string`\>

Defined in: [cockpit/src/visual.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cockpit/src/visual.ts#L43)

primitive key → inline control HTML (widget primitives only — for the preview)

***

### used

> **used**: [`UsedPrimitive`](../../visual/interfaces/UsedPrimitive.md)[]

Defined in: [cockpit/src/visual.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/cockpit/src/visual.ts#L38)

the distinct primitives every generated form/table is composed of (deduped across entities)
