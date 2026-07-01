[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/deploy](../README.md) / DeployPlan

# Interface: DeployPlan

Defined in: [types.ts:81](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/deploy/src/types.ts#L81)

`@suluk/deploy` — ship a Suluk app behind a SWAPPABLE target interface. A DeployProvider turns the app into
the files + ordered steps that deploy it; the host (the vscode extension) runs the steps in a terminal
after the user authenticates. Cloudflare is the first provider (Workers + D1 + static assets) — an adapter,
since the stack is already Cloudflare-native (Hono=Workers, sqlite-core=D1, frontend=assets). CANDIDATE.

## Properties

### files

> **files**: [`DeployFile`](DeployFile.md)[]

Defined in: [types.ts:83](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/deploy/src/types.ts#L83)

***

### notes

> **notes**: `string`[]

Defined in: [types.ts:86](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/deploy/src/types.ts#L86)

Human-facing notes (auth, manual fill-ins, caveats).

***

### provider

> **provider**: `string`

Defined in: [types.ts:82](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/deploy/src/types.ts#L82)

***

### steps

> **steps**: [`DeployStep`](DeployStep.md)[]

Defined in: [types.ts:84](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/deploy/src/types.ts#L84)
