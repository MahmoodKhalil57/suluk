[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / ProviderImpl

# Interface: ProviderImpl

Defined in: [builder/src/providers.ts:9](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/builder/src/providers.ts#L9)

Provider SLOTS (M3) — "swap out a provider you chose." A module declares `providerSlots` (e.g.
`{ payments: "stripe" }`); installModule records them into the document as `x-suluk-providers`. Each facet
(payments / auth / email / storage) is a SLOT bound to one implementation of a duck-typed interface — exactly
the pattern @suluk/stripe's `PaymentProvider` and @suluk/deploy's `DeployProvider` already prove. Swapping
rebinds the slot to another implementation of the SAME interface; the contract (the operations, their cost)
is unchanged — only the runtime binding differs. Pure (no host) → unit-tested.

## Properties

### description

> **description**: `string`

Defined in: [builder/src/providers.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/builder/src/providers.ts#L15)

***

### facet

> **facet**: `string`

Defined in: [builder/src/providers.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/builder/src/providers.ts#L11)

***

### id

> **id**: `string`

Defined in: [builder/src/providers.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/builder/src/providers.ts#L10)

***

### pkg?

> `optional` **pkg?**: `string`

Defined in: [builder/src/providers.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/builder/src/providers.ts#L14)

the `@suluk` package (or ecosystem source) that implements this binding, if any

***

### title

> **title**: `string`

Defined in: [builder/src/providers.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/builder/src/providers.ts#L12)
