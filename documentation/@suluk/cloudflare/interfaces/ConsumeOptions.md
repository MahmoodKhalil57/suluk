[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cloudflare](../README.md) / ConsumeOptions

# Interface: ConsumeOptions

Defined in: [tooling/ts/packages/cloudflare/src/ratelimit.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cloudflare/src/ratelimit.ts#L11)

A KV-backed RateLimitStore — the production durable counter @suluk/hono's `enforceRateLimit` needs (its
MemoryRateLimitStore is DEV-only; it doesn't coordinate across Workers isolates). Fixed-window counter in a
Workers KV namespace, fail-OPEN to a fallback store on any KV blip so a KV outage never hard-blocks traffic.

Structurally typed (no @suluk/hono dependency — the consume contract is tiny + stable), so the returned store
plugs straight into enforceRateLimit({ store }). The KV binding is resolved LAZILY (a getter) because on Workers
the binding isn't available at module-init — capture it on first request.

## Properties

### maxRequests

> **maxRequests**: `number`

Defined in: [tooling/ts/packages/cloudflare/src/ratelimit.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cloudflare/src/ratelimit.ts#L11)

***

### now

> **now**: `number`

Defined in: [tooling/ts/packages/cloudflare/src/ratelimit.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cloudflare/src/ratelimit.ts#L11)

***

### windowMs

> **windowMs**: `number`

Defined in: [tooling/ts/packages/cloudflare/src/ratelimit.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/cloudflare/src/ratelimit.ts#L11)
