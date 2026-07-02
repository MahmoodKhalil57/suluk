[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / computeSignature

# Function: computeSignature()

> **computeSignature**(`uriTemplate`, `req`): `object`

Defined in: [signature.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/core/src/signature.ts#L38)

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
