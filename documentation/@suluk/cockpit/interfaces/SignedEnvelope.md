[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / SignedEnvelope

# Interface: SignedEnvelope

Defined in: [builder/src/signing.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/builder/src/signing.ts#L10)

A signed registry payload: the registry value + a detached base64 signature over its canonical bytes.

## Properties

### publisher?

> `optional` **publisher?**: `string`

Defined in: [builder/src/signing.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/builder/src/signing.ts#L14)

***

### registry

> **registry**: `unknown`

Defined in: [builder/src/signing.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/builder/src/signing.ts#L11)

***

### signature

> **signature**: `string`

Defined in: [builder/src/signing.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/builder/src/signing.ts#L13)

base64 ECDSA-P256/SHA-256 signature over canonicalBytes(registry)
