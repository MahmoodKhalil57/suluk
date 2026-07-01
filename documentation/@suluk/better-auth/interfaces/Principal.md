[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/better-auth](../README.md) / Principal

# Interface: Principal

Defined in: [principal.ts:7](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/better-auth/src/principal.ts#L7)

The principal extractor — the loop-closer for per-viewer docs. A Better Auth session (its user role,
granted permissions, or an apiKey's scopes) is mapped to a { scopes } principal that @suluk/hono's
emitV4(routes, { principal }) uses to project the doc each viewer is allowed to see.

## Properties

### scopes

> **scopes**: `string`[]

Defined in: [principal.ts:8](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/better-auth/src/principal.ts#L8)
