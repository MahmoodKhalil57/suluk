[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / EmitOptions

# Interface: EmitOptions

Defined in: [journeys/src/emit.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/journeys/src/emit.ts#L28)

## Extends

- [`BindOptions`](BindOptions.md)

## Properties

### aliases?

> `optional` **aliases?**: `Record`\<`string`, `string`\>

Defined in: [journeys/src/bind.ts:82](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/journeys/src/bind.ts#L82)

shorthand for `definitions.steps` with 1:1 string values — an author-owned synonym map. Merged into definitions.

#### Inherited from

[`BindOptions`](BindOptions.md).[`aliases`](BindOptions.md#aliases)

***

### baseUrlEnv?

> `optional` **baseUrlEnv?**: `string`

Defined in: [journeys/src/emit.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/journeys/src/emit.ts#L34)

env var holding the live base URL (default: "SULUK_BASE_URL").

***

### clientFactory?

> `optional` **clientFactory?**: `string`

Defined in: [journeys/src/emit.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/journeys/src/emit.ts#L32)

named export that creates a client (default: "createClient").

***

### clientModule?

> `optional` **clientModule?**: `string`

Defined in: [journeys/src/emit.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/journeys/src/emit.ts#L30)

import specifier for the consumer's generated SDK (default: the consumer's local "./sdk").

***

### definitions?

> `optional` **definitions?**: [`Definitions`](Definitions.md)

Defined in: [journeys/src/bind.ts:84](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/journeys/src/bind.ts#L84)

the scaffolder's full mapping layer (aliases + decompositions + named journeys).

#### Inherited from

[`BindOptions`](BindOptions.md).[`definitions`](BindOptions.md#definitions)

***

### maxHoles?

> `optional` **maxHoles?**: `number`

Defined in: [journeys/src/bind.ts:86](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/journeys/src/bind.ts#L86)

how many coverage-hole stubs to emit (default: all).

#### Inherited from

[`BindOptions`](BindOptions.md).[`maxHoles`](BindOptions.md#maxholes)

***

### tokenEnv?

> `optional` **tokenEnv?**: `string`

Defined in: [journeys/src/emit.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/journeys/src/emit.ts#L36)

env var holding a bearer token for authenticated scenarios (default: "SULUK_USER_TOKEN").
