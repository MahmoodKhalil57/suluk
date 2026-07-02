[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/i18n](../README.md) / KeyParity

# Type Alias: KeyParity\<Default\>

> **KeyParity**\<`Default`\> = `{ [K in keyof Default]: string }`

Defined in: [messages.ts:94](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/i18n/src/messages.ts#L94)

Compile-time key-parity helper: a locale catalog typed `KeyParity<typeof enCatalog>` must declare EXACTLY the
default's keys (no missing, no extra). Use it on each non-default catalog so a dropped/typo'd key is a type error.

## Type Parameters

### Default

`Default` *extends* [`Catalog`](Catalog.md)
