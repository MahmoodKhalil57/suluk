[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / SignedEnvelope

# Interface: SignedEnvelope

Defined in: [signing.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/builder/src/signing.ts#L10)

A signed registry payload: the registry value + a detached base64 signature over its canonical bytes.

## Properties

### publisher?

> `optional` **publisher?**: `string`

Defined in: [signing.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/builder/src/signing.ts#L14)

***

### registry

> **registry**: `unknown`

Defined in: [signing.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/builder/src/signing.ts#L11)

***

### signature

> **signature**: `string`

Defined in: [signing.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/builder/src/signing.ts#L13)

base64 ECDSA-P256/SHA-256 signature over canonicalBytes(registry)
