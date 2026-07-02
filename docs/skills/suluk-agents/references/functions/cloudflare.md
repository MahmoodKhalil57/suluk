# Functions

## cloudflare

### `projectCloudflareAgent`
Project an agent → an owned Cloudflare Agents-SDK scaffold + the Durable Object descriptors. Pure, fail-loud.
Scaffolds the named agent AND every reachable sub-agent (each its own DO class file); the worker binds them all.
`opts.className` renames ONLY the root; sub-agents use PascalCase of their x-suluk-agents key.
```ts
projectCloudflareAgent(doc: OpenAPIv4Document, agentName: string, opts: CloudflareAgentOptions): CloudflareAgentArtifacts
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `agentName: string`
- `opts: CloudflareAgentOptions` — default: `{}`
**Returns:** `CloudflareAgentArtifacts`
