# Variables & Constants

## mcp.connections.service

### `McpConnectionsLive`
```ts
const McpConnectionsLive: any
```

## mcp.schema

### `mcpConnection`
One user's knobs on one OAuth connection they authorized. Composite PK (userId, clientId) — a connection is per-user,
 never the bare (shared) clientId. All knob columns are nullable (absent ⇒ no cap / full share / enabled).
```ts
const mcpConnection: any
```

## mcp.provision

### `mcpProvision`
```ts
const mcpProvision: InstanceSpec[]
```

## mcp.contract

### `mcpOps`
```ts
const mcpOps: { method: string; path: string; name: string; summary: string; tags: string[]; responses: { status: number; description: string }[] }[]
```
