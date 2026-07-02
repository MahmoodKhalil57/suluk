[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / RuntimeDeployHint

# Type Alias: RuntimeDeployHint

> **RuntimeDeployHint** = \{ `durableObjects`: `object`[]; `kind`: `"cloudflare"`; \} \| \{ `kind`: `"node"`; \}

Defined in: [agents/src/runtime.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/agents/src/runtime.ts#L24)

The provider-specific deploy hint — a discriminated union (tightened from `Record<string,unknown>` once a 2nd adapter
landed, per the C034 follow-up). Cloudflare ships the Durable Object descriptor for `@suluk/deploy`; the Node runtime
is a plain long-lived process with no provisioned infra. A future adapter adds a new `kind`.
