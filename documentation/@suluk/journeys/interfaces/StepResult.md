[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / StepResult

# Interface: StepResult

Defined in: [journeys/src/bind.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/journeys/src/bind.ts#L40)

## Properties

### canonical?

> `optional` **canonical?**: `string`

Defined in: [journeys/src/bind.ts:52](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/journeys/src/bind.ts#L52)

the canonical step phrase this UNBOUND step most likely maps to (drives the scaffolder's alias stub).

***

### expandedFrom?

> `optional` **expandedFrom?**: `object`

Defined in: [journeys/src/bind.ts:50](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/journeys/src/bind.ts#L50)

when this resolved step came from an alias/decomposition/journey expansion: the original authored prose it expanded from.

#### line

> **line**: `number`

#### text

> **text**: `string`

***

### handle

> **handle**: `string`

Defined in: [journeys/src/bind.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/journeys/src/bind.ts#L44)

the bound (or suggested) handle, when there is one.

***

### state

> **state**: [`BindState`](../type-aliases/BindState.md)

Defined in: [journeys/src/bind.ts:42](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/journeys/src/bind.ts#L42)

***

### step

> **step**: [`FeatureStep`](FeatureStep.md)

Defined in: [journeys/src/bind.ts:41](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/journeys/src/bind.ts#L41)

***

### suggest

> **suggest**: `string`

Defined in: [journeys/src/bind.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/journeys/src/bind.ts#L48)

a human next-action for a non-BOUND step.

***

### via

> **via**: `string`

Defined in: [journeys/src/bind.ts:46](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/journeys/src/bind.ts#L46)

provenance of a BOUND step.
