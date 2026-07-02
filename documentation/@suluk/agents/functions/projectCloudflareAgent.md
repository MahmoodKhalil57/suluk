[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / projectCloudflareAgent

# Function: projectCloudflareAgent()

> **projectCloudflareAgent**(`doc`, `agentName`, `opts?`): [`CloudflareAgentArtifacts`](../interfaces/CloudflareAgentArtifacts.md)

Defined in: [agents/src/cloudflare.ts:119](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/agents/src/cloudflare.ts#L119)

Project an agent → an owned Cloudflare Agents-SDK scaffold + the Durable Object descriptors. Pure, fail-loud.
Scaffolds the named agent AND every reachable sub-agent (each its own DO class file); the worker binds them all.
`opts.className` renames ONLY the root; sub-agents use PascalCase of their x-suluk-agents key.

## Parameters

### doc

[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)

### agentName

`string`

### opts?

[`CloudflareAgentOptions`](../interfaces/CloudflareAgentOptions.md) = `{}`

## Returns

[`CloudflareAgentArtifacts`](../interfaces/CloudflareAgentArtifacts.md)
