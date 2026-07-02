# Variables & Constants

## runtime

### `runtimeProviders`
The runtime-provider registry. Add new targets here; the interface is the contract (mirrors `@suluk/deploy`'s `providers`).
```ts
const runtimeProviders: Record<string, AgentRuntimeProvider>
```

### `cloudflareRuntime`
The Cloudflare adapter — wraps `projectCloudflareAgent` into the generic seam (its `durableObjects` → the deploy hint).
```ts
const cloudflareRuntime: AgentRuntimeProvider<CloudflareAgentOptions>
```

### `nodeRuntime`
The Node/Bun adapter — wraps `projectNodeAgent`. A plain long-lived process, so the deploy hint carries no infra.
```ts
const nodeRuntime: AgentRuntimeProvider<NodeAgentOptions>
```

## catalog

### `SEED_CATALOG`
Illustrative seed — NOT the live catalog. Tiers reflect coarse public standing as of asOf; UNKNOWN is honest.
```ts
const SEED_CATALOG: ModelCatalog
```

## profiles

### `PROFILES`
```ts
const PROFILES: Record<Profile, ResolvedProfile>
```

## pyramid

### `FLOOR_LEVEL`
Routes — the deterministic floor — sit at level 0. The lowest an orchestrating agent can sit is level 1.
```ts
const FLOOR_LEVEL: 0
```
