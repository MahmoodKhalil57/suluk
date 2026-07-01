[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / DemoRequest

# Interface: DemoRequest

Defined in: [journeys/src/demos.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/journeys/src/demos.ts#L27)

## Properties

### body?

> `optional` **body?**: `Record`\<`string`, [`DemoValue`](../type-aliases/DemoValue.md)\>

Defined in: [journeys/src/demos.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/journeys/src/demos.ts#L36)

***

### captures

> **captures**: [`DemoCapture`](DemoCapture.md)[]

Defined in: [journeys/src/demos.ts:37](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/journeys/src/demos.ts#L37)

***

### label

> **label**: `string`

Defined in: [journeys/src/demos.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/journeys/src/demos.ts#L29)

the human label (the op name).

***

### method

> **method**: `string`

Defined in: [journeys/src/demos.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/journeys/src/demos.ts#L32)

***

### name

> **name**: `string`

Defined in: [journeys/src/demos.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/journeys/src/demos.ts#L31)

the op's by-name handle name (for chaining resolution).

***

### needsAuth

> **needsAuth**: `boolean`

Defined in: [journeys/src/demos.ts:35](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/journeys/src/demos.ts#L35)

***

### path

> **path**: `string`

Defined in: [journeys/src/demos.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/journeys/src/demos.ts#L34)

path with `{param}` substituted to a row value or a `{{param}}` variable; prefixed with `{{baseUrl}}` at render.
