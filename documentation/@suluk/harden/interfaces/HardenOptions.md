[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/harden](../README.md) / HardenOptions

# Interface: HardenOptions

Defined in: [harden.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/harden/src/harden.ts#L13)

Overridable floors — defaults match the baseline (1024 chars / ±1e12 / 1000 items / no control chars).

## Properties

### maxItems?

> `optional` **maxItems?**: `number`

Defined in: [harden.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/harden/src/harden.ts#L19)

***

### maxLength?

> `optional` **maxLength?**: `number`

Defined in: [harden.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/harden/src/harden.ts#L14)

***

### numberMax?

> `optional` **numberMax?**: `number`

Defined in: [harden.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/harden/src/harden.ts#L17)

***

### numberMin?

> `optional` **numberMin?**: `number`

Defined in: [harden.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/harden/src/harden.ts#L18)

***

### textPattern?

> `optional` **textPattern?**: `string` \| `null`

Defined in: [harden.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/harden/src/harden.ts#L16)

reject NUL + control chars (tab/newline/CR allowed). Pass null to skip adding a pattern.
