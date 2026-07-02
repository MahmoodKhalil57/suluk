---
description: Reference tooling for the OpenAPI v4.0 Suluk candidate.
name: suluk-registry-webhooks
---

# suluk

Reference tooling for the OpenAPI v4.0 Suluk candidate.

## Configuration

**WebhookConfig** — The endpoint signing secret (`whsec_…`), from env — declare `STRIPE_WEBHOOK_SECRET` in your `wrangler`/`.dev.vars`. (1 options — see references/config.md)

## Quick Reference

**webhooks.service:** `webhookCfgFromEnv`, `WebhookCfgLive`, `WebhookCfg`, `Webhooks`, `WebhookEnv` (Build the config from env), `defaultHandlers` (The DEFAULT handler set — a documented STUB), `WebhooksLive`
**webhooks.routes:** `webhooksRoutes`
**webhooks.schema:** `webhookEvent` (The at-least-once dedup ledger — one row per PROCESSED Stripe event, so redelivery of the same `evt_…` is a no-op)
**webhooks.provision:** `webhooksProvision`
**webhooks.contract:** `webhooksOps`

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When using a class → read `references/classes.md` for properties, methods, and inheritance
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults