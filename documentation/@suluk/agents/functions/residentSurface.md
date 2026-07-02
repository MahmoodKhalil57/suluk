[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / residentSurface

# Function: residentSurface()

> **residentSurface**(`doc`, `agentName`): `string`[]

Defined in: [agents/src/conformance.ts:59](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/agents/src/conformance.ts#L59)

The RESIDENT surface of an agent (C027) — its own routes whose `tier` is not `cold-tail` (the default-visible
tool set). Cold-tail routes are revealed via `discover_tools`, never in the default list. This is the set a
conforming serving adapter must trim to for the context-reduction claim to bind.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### agentName

`string`

## Returns

`string`[]
