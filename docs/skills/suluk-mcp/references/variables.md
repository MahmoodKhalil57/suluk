# Variables & Constants

## protocol

### `DISCOVER_TOOL`
The synthetic meta-tool that reveals the cold-tail. It is NEVER routed to `exec` — handled in `tools/call`.
```ts
const DISCOVER_TOOL: { name: "discover_tools"; description: string; inputSchema: { type: "object"; properties: { intent: { type: "string"; description: "what you are trying to do — filters the cold-tail tools (omit to list all)" } } } }
```

### `LATEST_PROTOCOL`
```ts
const LATEST_PROTOCOL: "2025-06-18"
```

### `SUPPORTED_PROTOCOLS`
```ts
const SUPPORTED_PROTOCOLS: Set<string>
```
