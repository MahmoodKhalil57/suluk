[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/env](../README.md) / VarSpec

# Interface: VarSpec

Defined in: [schema.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/env/src/schema.ts#L17)

## Properties

### default?

> `optional` **default?**: `string`

Defined in: [schema.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/env/src/schema.ts#L23)

fallback value when absent.

***

### description?

> `optional` **description?**: `string`

Defined in: [schema.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/env/src/schema.ts#L26)

***

### example?

> `optional` **example?**: `string`

Defined in: [schema.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/env/src/schema.ts#L27)

***

### forbidInSurface?

> `optional` **forbidInSurface?**: `object`[]

Defined in: [schema.ts:37](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/env/src/schema.ts#L37)

value patterns that are FORBIDDEN on specific surfaces — e.g. a `sk_test_` key on `cloudflare`. Default
 severity "warning" (a gated nudge); set "error" to fail closed.

#### message?

> `optional` **message?**: `string`

#### pattern

> **pattern**: `string` \| `RegExp`

#### severity?

> `optional` **severity?**: [`IssueSeverity`](../type-aliases/IssueSeverity.md)

#### surfaces

> **surfaces**: [`Surface`](../type-aliases/Surface.md)[]

***

### minLength?

> `optional` **minLength?**: `number`

Defined in: [schema.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/env/src/schema.ts#L32)

the value, when present, must be at least this long (a too-short secret is a real misconfiguration).

***

### pattern?

> `optional` **pattern?**: `string` \| `RegExp`

Defined in: [schema.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/env/src/schema.ts#L30)

the value, when present, must match this regex (source string or RegExp).

***

### required?

> `optional` **required?**: `boolean`

Defined in: [schema.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/env/src/schema.ts#L21)

must be present (after defaults) — else parse() throws and health = "missing".

***

### requiredInSurface?

> `optional` **requiredInSurface?**: [`Surface`](../type-aliases/Surface.md)[]

Defined in: [schema.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/env/src/schema.ts#L34)

required ONLY when validating for one of these surfaces (in addition to `required`, which is always).

***

### secret?

> `optional` **secret?**: `boolean`

Defined in: [schema.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/env/src/schema.ts#L19)

a secret — its value must be ENCRYPTED at rest in the committed .env (plaintext is flagged).

***

### surfaces?

> `optional` **surfaces?**: [`Surface`](../type-aliases/Surface.md)[]

Defined in: [schema.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/env/src/schema.ts#L25)

which surfaces need this var (default: every surface). Drives the deploy/vscode projections.
