[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / PreviewEnvLike

# Interface: PreviewEnvLike

Defined in: [preview.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/better-auth/src/preview.ts#L28)

The two independent locks live on the Worker env: a var and a binding. Duck-typed; extra keys ignored.

## Properties

### PREVIEW\_DB?

> `optional` **PREVIEW\_DB?**: `unknown`

Defined in: [preview.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/better-auth/src/preview.ts#L32)

lock 2 — a D1 binding only the preview deploy declares (presence is the lock; we never read prod's DB here).

***

### SULUK\_PREVIEW?

> `optional` **SULUK\_PREVIEW?**: `string`

Defined in: [preview.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/better-auth/src/preview.ts#L30)

lock 1 — the deploy-time preview flag.
