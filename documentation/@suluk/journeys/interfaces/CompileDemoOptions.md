[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / CompileDemoOptions

# Interface: CompileDemoOptions

Defined in: [journeys/src/demos.ts:99](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/journeys/src/demos.ts#L99)

## Extends

- [`BindOptions`](BindOptions.md)

## Properties

### aliases?

> `optional` **aliases?**: `Record`\<`string`, `string`\>

Defined in: [journeys/src/bind.ts:82](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/journeys/src/bind.ts#L82)

shorthand for `definitions.steps` with 1:1 string values — an author-owned synonym map. Merged into definitions.

#### Inherited from

[`BindOptions`](BindOptions.md).[`aliases`](BindOptions.md#aliases)

***

### definitions?

> `optional` **definitions?**: [`Definitions`](Definitions.md)

Defined in: [journeys/src/bind.ts:84](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/journeys/src/bind.ts#L84)

the scaffolder's full mapping layer (aliases + decompositions + named journeys).

#### Inherited from

[`BindOptions`](BindOptions.md).[`definitions`](BindOptions.md#definitions)

***

### maxHoles?

> `optional` **maxHoles?**: `number`

Defined in: [journeys/src/bind.ts:86](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/journeys/src/bind.ts#L86)

how many coverage-hole stubs to emit (default: all).

#### Inherited from

[`BindOptions`](BindOptions.md).[`maxHoles`](BindOptions.md#maxholes)
