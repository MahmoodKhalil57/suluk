[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / computeSignature

# Function: computeSignature()

> **computeSignature**(`uriTemplate`, `req`): `object`

Defined in: [signature.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/core/src/signature.ts#L38)

Compute a request's canonical signature tuple + deterministic key string (C019 §A.2).

## Parameters

### uriTemplate

`string`

### req

[`Request`](../interfaces/Request.md)

## Returns

`object`

### key

> **key**: `string`

### tuple

> **tuple**: [`SignatureTuple`](../interfaces/SignatureTuple.md)
