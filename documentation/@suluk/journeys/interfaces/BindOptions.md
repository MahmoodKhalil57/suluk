[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / BindOptions

# Interface: BindOptions

Defined in: [journeys/src/bind.ts:80](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/journeys/src/bind.ts#L80)

## Extended by

- [`EmitOptions`](EmitOptions.md)
- [`CompileDemoOptions`](CompileDemoOptions.md)

## Properties

### aliases?

> `optional` **aliases?**: `Record`\<`string`, `string`\>

Defined in: [journeys/src/bind.ts:82](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/journeys/src/bind.ts#L82)

shorthand for `definitions.steps` with 1:1 string values — an author-owned synonym map. Merged into definitions.

***

### definitions?

> `optional` **definitions?**: [`Definitions`](Definitions.md)

Defined in: [journeys/src/bind.ts:84](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/journeys/src/bind.ts#L84)

the scaffolder's full mapping layer (aliases + decompositions + named journeys).

***

### maxHoles?

> `optional` **maxHoles?**: `number`

Defined in: [journeys/src/bind.ts:86](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/journeys/src/bind.ts#L86)

how many coverage-hole stubs to emit (default: all).
