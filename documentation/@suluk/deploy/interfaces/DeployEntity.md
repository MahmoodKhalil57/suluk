[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/deploy](../README.md) / DeployEntity

# Interface: DeployEntity

Defined in: [types.ts:9](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/deploy/src/types.ts#L9)

`@suluk/deploy` — ship a Suluk app behind a SWAPPABLE target interface. A DeployProvider turns the app into
the files + ordered steps that deploy it; the host (the vscode extension) runs the steps in a terminal
after the user authenticates. Cloudflare is the first provider (Workers + D1 + static assets) — an adapter,
since the stack is already Cloudflare-native (Hono=Workers, sqlite-core=D1, frontend=assets). CANDIDATE.

## Properties

### name

> **name**: `string`

Defined in: [types.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/deploy/src/types.ts#L10)

***

### schema

> **schema**: [`SchemaOrRef`](../../core/type-aliases/SchemaOrRef.md)

Defined in: [types.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/deploy/src/types.ts#L11)
