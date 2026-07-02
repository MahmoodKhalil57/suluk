[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / DocumentedRoute

# Type Alias: DocumentedRoute

> **DocumentedRoute** = [`RouteContract`](../interfaces/RouteContract.md) & \{ `summary`: `string`; \} \| \{ `description`: `string`; \}

Defined in: [tooling/ts/packages/hono/src/contract.ts:80](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/hono/src/contract.ts#L80)

A route that satisfies documentation coverage at the TYPE level: it MUST carry a `summary` or a `description`. Used by
[contractDoc](../functions/contractDoc.md) so a route authored with neither fails to type-check.
